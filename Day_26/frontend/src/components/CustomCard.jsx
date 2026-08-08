import { Card, Statistic } from "antd";

const CustomCard = ({ title, value, icon, key = null, color = '#C76A34' }) => {
  return (
    
    <Card
      key={key} 
      className="rounded-2xl border border-[#ECE6DF] shadow-sm text-center"
    >
      <Statistic
        title={title}
        value={value}
        prefix={icon ? <span style={{ marginInlineEnd: 8 }}>{icon}</span> : null}
        styles={{ content: { color } }}
      />
    </Card>
  );
};

export default CustomCard;