import { Typography, Button, Result } from "antd";
import { SmileOutlined } from "@ant-design/icons";

export default function Step5() {
  return (
    <div className="h-full flex items-center justify-center">
      <Result
        icon={<SmileOutlined style={{ color: "#1890ff", fontSize: "48px" }} />}
        title={<Typography.Title level={2}>Envio Concluído!</Typography.Title>}
        subTitle={
          <Typography.Text>
            Obrigado por enviar suas informações. Entraremos em contato em breve.
          </Typography.Text>
        }
        extra={
          <Button
            type="primary"
            onClick={() => window.location.reload()}
            style={{ height: "36px", fontWeight: "bold", fontSize: "16px" }}
          >
            Voltar para a página inicial
          </Button>
        }
      />
    </div>
  );
}