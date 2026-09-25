import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from backend.main import app

def test_case_intelligence_endpoints():
    async def _test():
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # 1. Test /cases/{case_id}/exits
            res_exits = await ac.get("/api/v1/cases/test-case-1/exits")
            assert res_exits.status_code == 200
            exits_data = res_exits.json()
            assert isinstance(exits_data, list)
            assert len(exits_data) > 0
            assert "exit_id" in exits_data[0]
            assert "tier" in exits_data[0]
            assert "vasp_name" in exits_data[0]

            # 2. Test /cases/{case_id}/gas-parent-clusters
            res_gas = await ac.get("/api/v1/cases/test-case-1/gas-parent-clusters")
            assert res_gas.status_code == 200
            gas_data = res_gas.json()
            assert isinstance(gas_data, list)
            assert len(gas_data) > 0
            assert "cluster_id" in gas_data[0]
            assert "gas_sponsor" in gas_data[0]
            assert "funded_wallets" in gas_data[0]

            # 3. Test /cases/{case_id}/cross-complaints
            res_cross = await ac.get("/api/v1/cases/test-case-1/cross-complaints")
            assert res_cross.status_code == 200
            cross_data = res_cross.json()
            assert isinstance(cross_data, list)
            assert len(cross_data) > 0
            assert "match_id" in cross_data[0]
            assert "fir_number" in cross_data[0]
            assert "shared_wallets" in cross_data[0]

    asyncio.run(_test())
