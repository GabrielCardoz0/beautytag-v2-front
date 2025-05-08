
import React from "react";
import { Modal, Form, Input, Select } from "antd";
const { TextArea } = Input;

interface ServiceModalProps {
  visible: boolean;
  title: string;
  onOk: () => void;
  onCancel: () => void;
  form: any;
  empresas: any[];
  calculatedValues: {
    collaboratorPrice: number;
    partnerPrice: number;
    profit: number;
  };
  updateCalculations: () => void;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  visible,
  title,
  onOk,
  onCancel,
  form,
  empresas,
  calculatedValues,
  updateCalculations,
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText={<span className="font-semibold">Salvar</span>}
      cancelText={<span className="font-semibold">Cancelar</span>}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Nome"
          name="name"
          rules={[{ required: true, message: "Por favor, insira o nome do serviço!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Descrição"
          name="description"
          rules={[{ required: true, message: "Por favor, insira a descrição do serviço!" }]}
        >
          <TextArea
            rows={4}
            allowClear
            onChange={(e) => form.setFieldsValue({ description: e.target.value })}
          />
        </Form.Item>

        <div className="flex gap-4">
          <Form.Item
            label="Preço (R$)"
            name="price"
            rules={[{ required: true, message: "Por favor, insira o preço do serviço!" }]}
            className="flex-1"
          >
            <Input
              type="text"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                form.setFieldsValue({
                  price: (Number(value) / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }),
                });
                updateCalculations();
              }}
            />
          </Form.Item>

          <Form.Item
            label="Repasse (%)"
            name="transferPercentage"
            rules={[{ required: true, message: "Por favor, insira a porcentagem de repasse!" }]}
            className="flex-1"
          >
            <Input
              type="number"
              min={0}
              max={100}
              suffix="%"
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value < 0 || value > 100) {
                  console.error("A porcentagem deve estar entre 0 e 100.");
                }
                updateCalculations();
              }}
            />
          </Form.Item>

          <Form.Item
            label="Colaborador (%)"
            name="collaboratorPercentage"
            rules={[{ required: true, message: "Por favor, insira a porcentagem para colaborador!" }]}
            className="flex-1"
          >
            <Input
              type="number"
              min={0}
              max={100}
              suffix="%"
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value < 0 || value > 100) {
                  console.error("A porcentagem deve estar entre 0 e 100.");
                }
                updateCalculations();
              }}
            />
          </Form.Item>
        </div>
        <div className="mt-4">
          <p><strong>Preço para Colaborador:</strong> {calculatedValues.collaboratorPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          <p><strong>Preço para Parceiro:</strong> {calculatedValues.partnerPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          <p><strong>Lucro:</strong> {calculatedValues.profit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
        </div>
        <Form.Item
          label="Gênero"
          name="genre"
          rules={[{ required: true, message: "Por favor, selecione o gênero!" }]}
        >
          <Select placeholder="Selecione o gênero">
            <Select.Option value="Masculino">Masculino</Select.Option>
            <Select.Option value="Feminino">Feminino</Select.Option>
            <Select.Option value="Unissex">Unissex</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Parceiro"
          name="company"
          rules={[{ required: true, message: "Por favor, selecione a empresa!" }]}
        >
          <Select placeholder="Selecione a empresa">
            {empresas?.map((company) => (
              <Select.Option key={company.id} value={company.id}>
                {company.name} - {company.id}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ServiceModal;