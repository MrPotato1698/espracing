import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Pilot {
  id: string;
  full_name: string;
  races: number;
  wins: number;
  podiums: number;
  poles: number;
  top5: number;
  top10: number;
  is_team_manager: boolean;
}

interface TeamPilotsTableProps {
  pilots: Pilot[];
  currentUserId: string;
  isCurrentUserManager: boolean;
  teamId: number;
  adminMode?: boolean;
}

export const TeamPilotsTable: React.FC<TeamPilotsTableProps> = ({
  pilots,
  currentUserId,
  isCurrentUserManager,
  teamId,
  adminMode = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [pilotList, setPilotList] = useState<Pilot[]>(pilots);

  // Contar managers
  const managerCount = pilotList.filter((p) => p.is_team_manager).length;

  const handleChangeManager = async (pilotId: string, makeManager: boolean) => {
    if (loading) return;
    const isSelf = pilotId === currentUserId;
    const pilot = pilotList.find(p => p.id === pilotId);
    if (isSelf) {
      window.showToast('No puedes cambiar tu propio estado de jefe de equipo.', 'info');
      return;
    }
    // Si se va a quitar el rol y no es admin, no permitir
    if (!adminMode && pilot?.is_team_manager && !makeManager) {
      window.showToast('Solo un administrador puede quitar el rol de jefe de equipo.', 'info');
      return;
    }
    // Comprobar mínimo 1 jefe de equipo antes de quitar el rol
    if (pilot?.is_team_manager && !makeManager && managerCount <= 1) {
      window.showToast('Debe haber al menos un jefe de equipo en el equipo.', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/admin/myteam', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pilotId, is_team_manager: makeManager }),
      });
      if (!response.ok) {
        window.showToast('Error actualizando el estado del manager', 'error');
      } else {
        window.showToast(`${makeManager ? 'Asignado' : 'Removido'} como jefe de equipo correctamente`, 'success');
        setPilotList((prev) => prev.map(p => p.id === pilotId ? { ...p, is_team_manager: makeManager } : p));
      }
    } catch (error) {
      window.showToast('Error: ' + error, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKickPilot = async (pilotId: string) => {
    if (loading) return;
    const isSelf = pilotId === currentUserId;
    const pilot = pilotList.find(p => p.id === pilotId);
    if (isSelf) {
      window.showToast('No puedes eliminarte a ti mismo del equipo.', 'info');
      return;
    }
    // Comprobar mínimo 1 jefe de equipo antes de eliminar
    if (pilot?.is_team_manager && managerCount <= 1) {
      window.showToast('Debe haber al menos un jefe de equipo en el equipo.', 'error');
      return;
    }
    if (!pilotId || !teamId) {
      window.showToast('Error: ID de usuario o equipo no definido', 'error');
      return;
    }
    console.log('Expulsando piloto:', { userId: pilotId, teamId });
    setLoading(true);
    try {
      const response = await fetch('/api/admin/myteam', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: pilotId, teamId, isCurrentUserManager }),
      });
      if (!response.ok) {
        window.showToast('Error expulsando piloto', 'error');
      } else {
        window.showToast('Piloto expulsado correctamente', 'success');
        setPilotList((prev) => prev.filter(p => p.id !== pilotId));
      }
    } catch (error) {
      window.showToast('Error: ' + error, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full data-table-container">
      <Table>
        <TableHeader className="font-medium bg-primary">
          <TableRow>
            <TableHead className="text-white justify-center">Nº</TableHead>
            <TableHead className="text-white">Nombre</TableHead>
            <TableHead className="text-white">Jefe de Equipo</TableHead>
            <TableHead className="text-white">Carreras</TableHead>
            <TableHead className="text-white">Victorias</TableHead>
            <TableHead className="text-white">Podios</TableHead>
            <TableHead className="text-white">Poles</TableHead>
            <TableHead className="text-white">Top 5</TableHead>
            <TableHead className="text-white">Top 10</TableHead>
            {(isCurrentUserManager || adminMode) && <TableHead className="text-white text-center">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pilotList.map((pilot, idx) => {
            const isSelf = pilot.id === currentUserId;
            // Solo permitir marcar como manager si no es uno mismo y si no está cargando
            // Si no es admin, solo permitir asignar (no quitar) el rol
            const canChangeManager = !isSelf && !loading && (adminMode || !pilot.is_team_manager || (pilot.is_team_manager && adminMode));
            return (
              <TableRow key={pilot.id} className={idx % 2 === 0 ? "bg-darkPrimary" : "bg-darkSecond"}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{pilot.full_name}</TableCell>
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    checked={pilot.is_team_manager}
                    disabled={
                      isSelf || loading || (!adminMode && pilot.is_team_manager && isCurrentUserManager)
                    }
                    onChange={async (e) => {
                      await handleChangeManager(pilot.id, e.target.checked);
                    }}
                    className="accent-primary bg-darkPrimary cursor-pointer size-4"
                    title={isSelf ? 'No puedes cambiar tu propio estado de jefe de equipo.' : undefined}
                  />
                </TableCell>
                <TableCell>{pilot.races}</TableCell>
                <TableCell>{pilot.wins}</TableCell>
                <TableCell>{pilot.podiums}</TableCell>
                <TableCell>{pilot.poles}</TableCell>
                <TableCell>{pilot.top5}</TableCell>
                <TableCell>{pilot.top10}</TableCell>
                {(isCurrentUserManager || adminMode) && (
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSelf || loading}
                      onClick={async () => {
                        if (!confirm("¿Seguro que quieres expulsar a este piloto?")) return;
                        await handleKickPilot(pilot.id);
                      }}
                      className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                      title={isSelf ? 'No puedes eliminarte a ti mismo del equipo.' : undefined}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
