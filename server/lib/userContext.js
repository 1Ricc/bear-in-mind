import db from '../db/database.js';

export function getUserContext(employeeId) {
  const employee = db.prepare(`
    SELECT e.first_name, e.points_total, e.team_id, t.team_name
    FROM employees e
    LEFT JOIN teams t ON e.team_id = t.team_id
    WHERE e.employee_id = ?
  `).get(employeeId);

  if (!employee) return null;

  const co2Result = db.prepare(`
    SELECT COALESCE(SUM(co2_saved_kg), 0) AS total
    FROM employee_activities
    WHERE employee_id = ?
  `).get(employeeId);

  const teams = db.prepare(`
    SELECT team_id FROM teams ORDER BY co2_reduction_kg DESC
  `).all();

  const teamRankIndex = teams.findIndex(t => t.team_id === employee.team_id);
  const teamRank = teamRankIndex >= 0 ? teamRankIndex + 1 : null;
  const teamCount = teams.length;

  const recentActivities = db.prepare(`
    SELECT a.activity_name
    FROM employee_activities ea
    JOIN activities a ON ea.activity_id = a.activity_id
    WHERE ea.employee_id = ?
    ORDER BY ea.date_logged DESC
    LIMIT 3
  `).all(employeeId);

  return {
    firstName: employee.first_name || 'there',
    pointsTotal: employee.points_total || 0,
    totalCo2SavedKg: co2Result.total || 0,
    teamName: employee.team_name || 'No Team',
    teamRank,
    teamCount,
    recentActivities: recentActivities.map(a => a.activity_name),
  };
}
