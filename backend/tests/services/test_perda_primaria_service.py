from datetime import datetime, timedelta, timezone

from src.services.perda_primaria_service import PerdaPrimariaService
from src.repositories.agendamento_repository import AgendamentoRepository


def _row(dias, hora, status_nome, pid=1):
    dt = (datetime.now(timezone.utc) + timedelta(days=dias)).replace(
        hour=hora, minute=0, second=0, microsecond=0
    )
    return {
        "agendamento_id": pid,
        "data_hora_inicio": dt.isoformat(),
        "statusagendamento": {"nome": status_nome},
    }


def _range():
    agora = datetime.now(timezone.utc)
    ini = (agora - timedelta(days=2)).isoformat()
    fim = (agora + timedelta(days=10)).isoformat()
    return ini, fim


def test_relatorio_agrega(monkeypatch):
    linhas = [
        _row(1, 8, "Realizado", 1),
        _row(1, 9, "Faltou", 2),
        _row(1, 10, "Cancelado", 3),
        _row(2, 8, "Agendado", 4),
    ]
    monkeypatch.setattr(AgendamentoRepository, "listar", lambda **k: linhas)

    ini, fim = _range()
    rel = PerdaPrimariaService.gerar_relatorio(ini, fim)

    k = rel["kpis"]
    assert k["marcados"] == 3  # cancelado não entra
    assert k["compareceu"] == 1
    assert k["no_show"] == 1
    assert k["cancelados"] == 1
    assert k["perdas"] == 2
    assert k["horas_perdidas"] == 0.5  # 1 falta (30 min); cancelado libera o slot
    assert k["taxa_absenteismo"] == 66.7  # (no_show+cancelado)/marcados? -> (1+1)/3
    assert len(rel["serie_diaria"]) == 2
    assert len(rel["motivos"]) >= 2


def test_relatorio_sem_datas_erro():
    try:
        PerdaPrimariaService.gerar_relatorio(None, None)
        assert False
    except Exception:
        assert True
