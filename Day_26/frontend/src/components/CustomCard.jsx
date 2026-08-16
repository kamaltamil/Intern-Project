import { Card, Statistic } from "antd";

const CustomCard = ({
  title,
  value,
  icon,
  key = null,
  color = "#C76A34",
  loading = false,
  formatter,
  precision,
  className = "",
  ...props
}) => {
  return (
    <Card
      key={key}
      loading={loading}
      className={`rounded-2xl border border-[#ECE6DF] shadow-sm text-center ${className}`}
      {...props}
    >
      <Statistic
        title={title}
        value={value}
        prefix={icon ? <span style={{ marginInlineEnd: 8 }}>{icon}</span> : null}
        formatter={formatter}
        precision={precision}
        styles={{ content: { color } }}
      />
    </Card>
  );
};

export default CustomCard;