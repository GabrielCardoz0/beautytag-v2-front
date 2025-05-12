"use client";

import React, { useEffect, useState } from "react";
import { Card, Descriptions, List, Modal, Button, Form, Input, InputNumber, Select } from "antd";
import { useUser } from "@/context/UserContext";
import { toast } from "react-toastify";
import { createNotification, getUsers } from "@/services";
import { convertToBRL, handleContactClick } from "@/utils";
import { useForm } from "antd/es/form/Form";

interface Metadata {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface Role {
  id: number;
  documentId: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
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

interface Parceiro {
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
  telefone: string;
  metadata: Metadata;
  name: string;
  role: Role;
  servicos: Servico[];
}

export default function ColaboradorDetalhes() {
  const { getUserFromLocalStorage } = useUser();
  const [parceiro, setParceiro] = useState<Parceiro | null>(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);
  const [serviceToRemoveIndex, setServiceToRemoveIndex] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = useForm(); 

  const fetchInfos = async () => {
    try {
      const user = getUserFromLocalStorage();
      setLoading(true);
      const response = await getUsers({
        "filters[id][$eq]": user.id,
        "populate": "*",
      });
      setParceiro(response.data[0]);
      setLoading(false);
      setServices(response.data[0].servicos.filter(item => item.publishedAt));
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível carregar suas informações. Tente novamente mais tarde");
    }
  }

  useEffect(() => { fetchInfos() }, []);

  const handleAddService = async (service: { name: string; descricao: string; preco: number; genero: string }) => {
    try {
      await createNotification({
        data: {
          title: `Novo serviço - ${parceiro.name}`,
          metadata: { 
            type: "service",
            ...service,
            empresa: parceiro.name,
            user_id: parceiro.id,
            user_document_id: parceiro.documentId,
          }
        }
      });

      form.resetFields();
      toast.success("Serviço criado com sucesso! Esperando confirmação do administrador.");
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar. Tente novamente mais tarde.");
    }
  };

  const openRemoveModal = (index: number) => {
    setServiceToRemoveIndex(index);
    setRemoveModalVisible(true);
  };

  const confirmRemoveService = async () => {
    if (serviceToRemoveIndex !== null) {
      const updatedServices = services.filter((_, i) => i !== serviceToRemoveIndex);
      setServices(updatedServices);
      setServiceToRemoveIndex(null);
    }
    setRemoveModalVisible(false);
  };

  const cancelRemoveService = () => {
    setServiceToRemoveIndex(null);
    setRemoveModalVisible(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };


  console.log(services);

  return (
    <>
      {
      loading
      ? "Carregando"
      : !parceiro ?
      "Não foi possível carregar" :
      <div className="w-full p-4 flex flex-col gap-8">
        <Card title={`${parceiro.name}`} style={{ width: "100%" }}>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID">{parceiro.id}</Descriptions.Item>
            <Descriptions.Item label="Nome">{parceiro.name}</Descriptions.Item>
            <Descriptions.Item label="CNPJ">{parceiro.cpf_cnpj}</Descriptions.Item>
            <Descriptions.Item label="Email">{parceiro.email}</Descriptions.Item>
            <Descriptions.Item label="Telefone">{parceiro.telefone}</Descriptions.Item>
            <Descriptions.Item label="Endereço">
              {`${parceiro.metadata.street}, ${parceiro.metadata.number}, ${parceiro.metadata.neighborhood}, ${parceiro.metadata.city} - ${parceiro.metadata.state}, CEP: ${parceiro.metadata.cep}`}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Meus Serviços" className="mt-4" style={{ width: "100%" }}>
          <List
            dataSource={services}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <Button key="remove" onClick={() => openRemoveModal(index)}>Remover</Button>,
                ]}
              >
                {item.name} - {convertToBRL(item.preco ?? 0)}
              </List.Item>
            )}
          />
          <div className="mt-4">
            <Button onClick={() => setIsModalOpen(true)}>Adicionar Serviço</Button>
          </div>
        </Card>

        <div className="text-center mt-5" style={{ marginTop: "20px", textAlign: "center" }}>
          <Button type="primary" onClick={showModal}>
            Solicitar alteração
          </Button>

          <div className="h-8"></div>
        </div>

        <Modal
          title="Entrar em Contato"
          open={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              Cancelar
            </Button>,
            <Button key="contact" type="primary" onClick={() => handleContactClick("https://wa.me/qr/JMXJMWC7DAFRG1")}>
              Abrir WhatsApp
            </Button>,
          ]}
        >
          <p>Você será redirecionado para o WhatsApp para entrar em contato.</p>
        </Modal>

        <Modal
          title="Adicionar Serviço"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Form
            layout="vertical"
            onFinish={handleAddService}
            form={form}
          >
            <Form.Item label="Nome" name="name" rules={[{ required: true, message: "Por favor, insira o nome do serviço" }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Descrição" name="descricao" rules={[{ required: true, message: "Por favor, insira a descrição do serviço" }]}>
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Preço" name="preco" rules={[{ required: true, message: "Por favor, insira o preço do serviço" }]}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Gênero" name="genero" rules={[{ required: true, message: "Por favor, selecione o gênero do serviço" }]}>
              <Select>
                <Select.Option value="Masculino">Masculino</Select.Option>
                <Select.Option value="Feminino">Feminino</Select.Option>
                <Select.Option value="Unissex">Unissex</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">Adicionar</Button>
            </Form.Item>
          </Form>
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
