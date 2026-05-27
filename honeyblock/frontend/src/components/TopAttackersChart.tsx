import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from '../theme'

interface Props {
  data: { ip: string; count: number }[]
  /** Fires when the user clicks a bar — receives the IP for that bar. */
  onBarClick?: (ip: string) => void
}

function TopAttackersChart({ data, onBarClick }: Props) {
  const { theme } = useTheme()

  if (data.length === 0) {
    return (
      <div style={{ color: theme.textSecondary, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        No attacker data yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 16, left: 14, bottom: 14 }} barCategoryGap="3%">
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={theme.cardBorder} />
        <XAxis
          dataKey="ip"
          tick={{ fill: theme.axisTick, fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={62}
          label={{
            value: 'Attacker IP',
            position: 'insideBottom',
            offset: -2,
            style: { fill: theme.textSecondary, fontSize: 10, textAnchor: 'middle' },
          }}
        />
        <YAxis
          tick={{ fill: theme.textSecondary, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={34}
          label={{
            value: 'Number of Attacks',
            angle: -90,
            position: 'insideLeft',
            offset: -8,
            style: { fill: theme.textSecondary, fontSize: 10, textAnchor: 'middle' },
          }}
        />
        <Tooltip
          cursor={{ fill: theme.barCursor }}
          contentStyle={{
            background: theme.tooltipBg,
            border: `1px solid ${theme.tooltipBorder}`,
            borderRadius: 8,
            color: theme.textPrimary,
            fontSize: 12,
            boxShadow: `0 4px 12px ${theme.shadow}`,
          }}
          labelStyle={{ color: theme.heading, fontWeight: 600, fontSize: 12 }}
          formatter={(value) => [value as number, 'Sessions']}
        />
        <Bar
          dataKey="count"
          fill={theme.iconAccent}
          radius={[6, 6, 0, 0]}
          name="Sessions"
          maxBarSize={40}
          cursor={onBarClick ? 'pointer' : 'default'}
          onClick={(data: unknown) => {
            // recharts passes the row payload as the first arg; pluck the IP off it
            const ip = (data as { payload?: { ip?: string }; ip?: string } | undefined)?.payload?.ip
              ?? (data as { ip?: string } | undefined)?.ip
            if (onBarClick && ip) onBarClick(ip)
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default TopAttackersChart
