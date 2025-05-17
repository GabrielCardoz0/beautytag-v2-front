import { verifyEmail } from "@/services";
import { Button, Form, Input, Select, DatePicker, Typography } from "antd";
import { useEffect } from "react";
import { toast } from "react-toastify";
const { Title } = Typography;

interface Step3Props {
  handleNextStep: (any: any) => void;
  handlePrevStep: () => void;
  userData: any;
}

export default function Step3({ handleNextStep, handlePrevStep, userData }: Step3Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (userData) {
      form.setFieldsValue(userData);
    }
  }, [userData, form]);

  const handleFinish = async (values: any) => {
    try {
      const verifyUser = await verifyEmail({
        filters: {
          email: {
            $eq: values.email,
          },
        }
      });

      if (verifyUser.data.length > 0) {
        toast.error("Este email já está cadastrado");
        return;
      }

    } catch {}

    values.cpf = values.cpf.replace(/\D/g, "");
    values.whatsapp = values.whatsapp.replace(/\D/g, "");
    values.cep = values.cep.replace(/\D/g, "");

    handleNextStep(values);
  };

  return (
    <div>
      <Title level={2} className="text-2xl font-bold mb-4">Informações Pessoais</Title>
      <Form
        form={form} // <= passa a instância aqui
        layout="vertical"
        onFinish={handleFinish}
        className="w-full max-w-md"
        initialValues={userData || {}}
      >
        <Form.Item label="Nome" name="nome" rules={[{ required: true, message: "Por favor, insira seu nome completo" }]}>
          <Input placeholder="Digite aqui" />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Por favor, insira um email válido" }]}>
          <Input placeholder="Digite aqui" />
        </Form.Item>
        <Form.Item label="CPF" name="cpf" rules={[{ required: true, message: "Por favor, insira seu CPF" }]}>
          <Input placeholder="Digite aqui" />
        </Form.Item>
        <Form.Item label="Gênero" name="publico" rules={[{ required: true, message: "Por favor, selecione o público" }]}>
          <Select placeholder="Selecione">
            <Select.Option value="masculino">Masculino</Select.Option>
            <Select.Option value="feminino">Feminino</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Empresa" name="empresa" rules={[{ required: true, message: "Por favor, insira a empresa que trabalha" }]}>
          <Input placeholder="Digite aqui" />
        </Form.Item>
        <Form.Item label="Whatsapp" name="whatsapp" rules={[{ required: true, message: "Por favor, insira seu número de Whatsapp" }]}>
          <Input placeholder="Digite aqui" />
        </Form.Item>
        <Form.Item label="Data de Nascimento" name="dataNascimento" rules={[{ required: true, message: "Por favor, insira sua data de nascimento" }]}>
          <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="dd/mm/aaaa" />
        </Form.Item>
        <Form.Item label="CEP" name="cep" rules={[{ required: true, message: "Por favor, insira seu CEP" }]}>
          <Input placeholder="Digite aqui" />
        </Form.Item>

        <div className="h-4"></div>

        <Form.Item>
          <Button type="primary" htmlType="submit" block style={{ height: "36px", fontWeight: "bold", fontSize: "16px" }}>
            Próximo
          </Button>
        </Form.Item>

        <Form.Item>
          <Button type="default" onClick={handlePrevStep} block style={{ height: "36px", fontWeight: "bold", fontSize: "16px" }}>
            Voltar
          </Button>
        </Form.Item>

      </Form>
    </div>
  );
};
