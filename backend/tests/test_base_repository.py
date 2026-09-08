from types import SimpleNamespace

from src.repositories.base_repository import BaseRepository


def test_extrair_data_com_resposta_none():
    # maybe_single sem registro retorna None em supabase-py
    assert BaseRepository._extrair_data(None) is None


def test_extrair_data_com_data_vazia():
    assert BaseRepository._extrair_data(SimpleNamespace(data=None)) is None
    assert BaseRepository._extrair_data(SimpleNamespace(data=[])) is None


def test_extrair_data_com_data():
    r = BaseRepository._extrair_data(SimpleNamespace(data={"id": 1}))
    assert r == {"id": 1}
