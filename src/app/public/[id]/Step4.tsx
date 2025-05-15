import { Button, Modal, Form, Select, Typography } from "antd";
import { useState, useEffect } from "react";
import { FormularioOpcao } from "./page";
import { convertToBRL } from "@/utils";

const { Title, Text } = Typography;

interface Step4Props {
  handlePrevStep: () => void;
  handleNextStep: (params: any) => void;
  options: FormularioOpcao[] | undefined;
}

export default function Step4({ handlePrevStep, handleNextStep, options }: Step4Props) {
  const [services, setServices] = useState<Record<string, { frequency: number; total: number }>>({});

  const handleServiceChange = (oldId: string, newId: string, price: number, frequency: number) => {
    setServices(prev => {
      const updated = { ...prev };
      if (oldId !== newId) delete updated[oldId];
      updated[newId] = { frequency, total: price * frequency };
      return updated;
    });
  };

  const handleRemoveService = (id: string) => {
    setServices(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const planTotal = Object.values(services).reduce((sum, { total }) => sum + total, 0);

  const handleSubmit = () => {
    const selected = Object.entries(services).map(([id, { frequency }]) => {
      const option = options?.find(opt => opt.servico.documentId === id || opt.servicos_secundarios.some(sub => sub.documentId === id));
      const selectedService = option?.servico.documentId === id ? option.servico : option?.servicos_secundarios.find(sub => sub.documentId === id);

      return {
        id,
        frequency,
        frequency_name: `${frequency}x por mês`,
        name: selectedService?.name,
        price: selectedService?.preco_colab
      };
    });
    handleNextStep(selected);
  };

  return (
    <div >
      <Title level={2} className="text-2xl font-bold mb-4">Escolha os Serviços</Title>

      <Form layout="vertical" onFinish={handleSubmit} className="w-full max-w-md">
        {options?.length ? (
          options.map(option => (
            <ServiceItem key={option.id} option={option} onChange={handleServiceChange} onRemove={handleRemoveService} />
          ))
        ) : (
          <Text>Nenhuma opção disponível.</Text>
        )}

        <div className="flex flex-col gap-4">
          <Text className="block mt-4 font-bold text-lg">
            Total do Plano: {convertToBRL(planTotal ?? 0)}
          </Text>

          <Button type="primary" htmlType="submit" block className="h-9 font-bold text-lg">
            Finalizar
          </Button>

          <Button type="default" onClick={handlePrevStep} block className="h-9 font-bold text-lg">
            Voltar
          </Button>
        </div>
      </Form>

      <div className="h-4"></div>
    </div>
  );
}

interface ServiceItemProps {
  option: FormularioOpcao;
  onChange: (oldId: string, newId: string, price: number, frequency: number) => void;
  onRemove: (id: string) => void;
}

function ServiceItem({ option, onChange, onRemove }: ServiceItemProps) {
  const { servico, servicos_secundarios } = option;
  const [selected, setSelected] = useState(servico);
  const [modalVisible, setModalVisible] = useState(false);
  const [frequency, setFrequency] = useState<number | null>(null);

  useEffect(() => {
    if (frequency !== null && selected) {
      onChange(servico.documentId, selected.documentId, selected.preco_colab, frequency);
    }
  }, [selected, frequency]);

  const handleServiceSelect = (id: number) => {
    const found = id === servico.id ? servico : servicos_secundarios.find(sub => sub.id === id);
    if (found) {
      setSelected(found);
      setModalVisible(false);
    }
  };

  const handleRemove = (id: string) => {
    setFrequency(null);
    setSelected(servico);
    onRemove(id);
  }

  return (
    <div className="mb-6 border p-4 rounded">
      <Title level={4}>{selected?.name || "Serviço não encontrado"}</Title>

      {servicos_secundarios.length > 0 && (
        <Button type="link" onClick={() => setModalVisible(true)}>
          Trocar serviço
        </Button>
      )}

      <div>
        <Text>{selected?.descricao || "Descrição não disponível"}</Text>
        <Text className="block mt-2 font-semibold">
          Preço: {convertToBRL(selected?.preco_colab ?? 0)}
        </Text>
      </div>

      <Form.Item label="Frequência">
        <Select
          placeholder="Selecione a frequência"
          value={frequency?.toString()}
          onChange={(value) => setFrequency(Number(value))}
          className="w-full"
        >
          {[1, 2, 3, 4].map(n => (
            <Select.Option key={n} value={n.toString()}>
              {n}x por mês
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {frequency !== null && selected && (
        <Text className="block mt-2 font-semibold">
          Total: {convertToBRL(selected.preco_colab * frequency)}
        </Text>
      )}
      {frequency !== null && selected && (
        <Button type="link" danger onClick={() => handleRemove(selected.documentId)}>
          Remover serviço
        </Button>
      )}

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        centered
      >
        <Title level={4}>Trocar Serviço</Title>

        <Select className="w-full mt-4" onChange={handleServiceSelect}>
          <Select.Option key={servico?.id} value={servico?.id}>
            {servico?.name || "Serviço principal"} - {convertToBRL(servico?.preco_colab ?? 0)} (Principal)
          </Select.Option>
          {servicos_secundarios.map(sub => (
            <Select.Option key={sub.id} value={sub.id}>
              {sub.name} - {convertToBRL(sub.preco_colab ?? 0)}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
}
