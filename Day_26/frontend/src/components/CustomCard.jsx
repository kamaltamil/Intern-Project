import { Card, Statistic } from "antd"


const CustomCard = ({ title, value, icon, key, color = '#C76A34' }) => {
  return (
    <Card className="rounded-2xl border border-[#ECE6DF] shadow-sm text-center">
        <Statistic
          title={title}
          value={value}
          prefix={<span style={{ marginInlineEnd: 8 }}>{icon}</span>}
          valueStyle={{ color }}
        />
    </Card>
  )
}

export default CustomCard