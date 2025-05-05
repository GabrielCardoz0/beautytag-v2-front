"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, Descriptions, List, Modal, Button, Select } from "antd";
import { convertToBRL } from "@/utils";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { createPlanoServico, deletePlanoServico, getPlanos, getServicos, getUserById } from "@/services";
import moment from "moment";


interface Colaborador {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  cpf_cnpj: string;
  telefone: string | null;
  metadata: Metadata;
  name: string;
}

interface Servico {
  id: number;
  documentId: string;
  name: string;
  descricao: string;
  preco: number;
  percent_colab: number;
  percent_repasse: number;
  preco_colab: number;
  preco_parceiro: number;
  lucro: number;
  genero: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface Metadata {
  genero: string;
  data_nascimento: string;
  cep: string;
  empresa: string;
}

interface Servico {
  id: number;
  documentId: string;
  name: string;
  descricao: string;
  preco: number;
  percent_colab: number;
  percent_repasse: number;
  preco_colab: number;
  preco_parceiro: number;
  lucro: number;
  genero: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

interface PlanoServico {
  id: number;
  documentId: string;
  frequencia: string;
  frequencia_value: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  servico: Servico;
}

interface Plano {
  id: number;
  documentId: string;
  is_pago: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  plano_servicos: PlanoServico[];
}

export default function ColaboradorDetalhes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [serviceToRemove, setServiceToRemove] = useState<PlanoServico | null>(null);
  const [plano, setPlano] = useState<Plano | null>(null);
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [services, setServices] = useState<Servico[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<number>(1);
  const { id } = useParams();

  const totalPlan = useMemo(() => {
    if (!plano || !plano.plano_servicos) return 0;

    return plano.plano_servicos.reduce((total, planoServico) => {
      return total + (planoServico.servico.preco_colab * planoServico.frequencia_value);
    }, 0);
  }, [plano]);

  const availableServices = useMemo<Servico[]>(() => {
    const planServicesIds = plano?.plano_servicos?.map(ps => ps.servico.documentId) ?? [];
    return services.filter(service => !planServicesIds.includes(service.documentId));
  }, [plano, services]);

  const fetchColab = async () => {
    try {
      const res = await getUserById(id.toString());
      setColaborador(res.data)
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível buscar as informações do colaborador. Tente novamente mais tarde.");
    }
  }

  const fetchServicos = async () => {
    try {
      const res = await getServicos({});
      setServices(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível buscar as informações do colaborador. Tente novamente mais tarde.");
    }
  }

  const fetchPlano = async () => {
    try {
      const res = await getPlanos({
        "filters[users_permissions_user][id][$eq]": id,
        populate: "plano_servicos.servico"
      });
      setPlano(res.data.data[0]);
    } catch (error) {
      console.error(error);
      toast.error('Houve um erro ao buscar a lista de serviços do parceiro!');
    }
  }

  useEffect(() => {
    fetchColab();
    fetchPlano();
    fetchServicos();
  }, [id]);

  const handleAddService = async (service: Servico) => {
    try {
      await createPlanoServico({
        data: {
          servico: service.documentId,
          frequencia: `${selectedFrequency}x por mês`,
          frequencia_value: selectedFrequency,
          planos: [plano.documentId],
        }
      });
      fetchPlano();
      setIsModalOpen(false);
      setSelectedFrequency(1);
      toast.success("Serviço adicionado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao adicionar o serviço. Tente novamente mais tarde.");
    }
  };

  const openRemoveModal = (item: PlanoServico) => {
    setServiceToRemove(item);
    setRemoveModalVisible(true);
  };

  const confirmRemoveService = async () => {
    try {
      await deletePlanoServico(serviceToRemove.documentId);
      fetchPlano();
      setRemoveModalVisible(false);
      toast.success("Serviço removido com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover serviço. Tente novamente mais tarde.");
    }
  };

  const cancelRemoveService = () => {
    setServiceToRemove(null);
    setRemoveModalVisible(false);
  };

  return (
    <>
    {
      !colaborador ? "Carregando" : 
      <div className="w-full p-4 flex gap-8">
        <Card title={`Detalhes do Colaborador - ${colaborador.name}`} style={{ width: "100%" }}>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID">{colaborador.id}</Descriptions.Item>
            <Descriptions.Item label="Nome">{colaborador.name}</Descriptions.Item>
            <Descriptions.Item label="CPF">{colaborador.cpf_cnpj}</Descriptions.Item>
            <Descriptions.Item label="Email">{colaborador.email}</Descriptions.Item>
            <Descriptions.Item label="Telefone">{colaborador.telefone}</Descriptions.Item>
            <Descriptions.Item label="Gênero">{colaborador.metadata.genero}</Descriptions.Item>
            <Descriptions.Item label="Empresa">{colaborador.metadata.empresa}</Descriptions.Item>
            <Descriptions.Item label="Data de Nascimento">{moment(colaborador.metadata.data_nascimento).format("DD.MM.YYYY")}</Descriptions.Item>
            <Descriptions.Item label="CEP">{colaborador.metadata.cep  }</Descriptions.Item>
            <Descriptions.Item label="Total do Plano">
              {convertToBRL(totalPlan ?? 0)}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Serviços" className="mt-4" style={{ width: "100%" }}>
          <List
            dataSource={plano.plano_servicos}
            renderItem={(item, index) => (
              <List.Item
                key={index}
                actions={[
                  <Button key={""} onClick={() => openRemoveModal(item)}>Remover</Button>,
                ]}
              >
                {item.servico.name} - {convertToBRL(item?.servico?.preco_colab ?? 0)}
              </List.Item>
            )}
          />
          <div className="mt-4">
            <Button onClick={() => setIsModalOpen(true)}>Adicionar Serviço</Button>
          </div>
        </Card>

        <Modal
          title="Adicionar Serviço"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <div className="mb-4">
            <label>Selecione a frequência:</label>
            <Select
              style={{ width: "100%" }}
              value={selectedFrequency}
              onChange={(value) => setSelectedFrequency(value)}
            >
              <Select.Option value={1}>1x por mês</Select.Option>
              <Select.Option value={2}>2x por mês</Select.Option>
              <Select.Option value={3}>3x por mês</Select.Option>
              <Select.Option value={4}>4x por mês</Select.Option>
            </Select>
          </div>
          <List
            dataSource={availableServices}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key={"button2"} type="primary" onClick={() => handleAddService(item)}>
                    Adicionar
                  </Button>,
                ]}
              >
                {item.name} - {convertToBRL(item?.preco_colab ?? 0)}
              </List.Item>
            )}
          />
        </Modal>

        <Modal
          title="Confirmar remoção"
          open={removeModalVisible}
          onOk={confirmRemoveService}
          onCancel={cancelRemoveService}
          okText="Sim"
          cancelText="Não"
        >
          <p>Tem certeza que deseja remover este serviço?</p>
        </Modal>
      </div>
    }
    </>
  );
}
