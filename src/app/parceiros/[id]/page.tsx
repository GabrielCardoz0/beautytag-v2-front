"use client";

import React from 'react'; // Adicionado para resolver o erro "React is not defined"
import { getServicos, getUserById, updateUser } from '@/services';
import { Form, Input, Button, Row, Col, List, Modal } from 'antd'; // Importação do Modal adicionada
import { useParams, useRouter } from 'next/navigation'; // Importação do hook useParams
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { deletarServico } from '@/utils';

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
  telefone: string | null;
  metadata: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
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

export default function Page() {
  const { id } = useParams();
  const [parceiro, setParceiro] = useState<Parceiro>(null);
  const [servicosList, setServicosList] = useState<Servico[]>(null);
  const router = useRouter();

  const fetchParceiro = async () => {
    try {
      const parceiroResponse = await getUserById(Number(id));
      setParceiro(parceiroResponse.data);
    } catch (error) {
      console.error(error);
      toast.error('Houve um erro ao buscar o parceiro!');
    }
  }

  const fetchParceiroServicos = async () => {
    try {
      const servicosResponse = await getServicos({
        "filters[users_permissions_user][id][$eq]": id
      });

      setServicosList(servicosResponse.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Houve um erro ao buscar a lista de serviços do parceiro!');
    }
  }

  useEffect(() => {
    fetchParceiro();
    fetchParceiroServicos();
  }, [id]);

  const updateParceiro = async (values: any) => {
    try {
      await updateUser(Number(id), {
        name: values.name,
        email: values.email,
        telefone: values.phone,
        cpf_cnpj: values.cnpj,
        metadata: {
          cep: values.cep,
          street: values.street,
          number: values.number,
          neighborhood: values.neighborhood,
          city: values.city,
          state: values.state,
        },
      });

      toast.success('Parceiro atualizado com sucesso!');

      router.push('/parceiros');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar o parceiro!');
    }
  }

  return (
    <div className='w-full p-12 flex gap-16'>
      {parceiro ? <ParceiroForm parceiro={parceiro} onFinish={updateParceiro} /> : <p>Carregando...</p>}
      {servicosList ? <ServicosList servicosList={servicosList} fetchServicos={fetchParceiroServicos} /> : <p>Carregando...</p>}
    </div>
  );
}

function ParceiroForm({ parceiro, onFinish }: { parceiro: Parceiro, onFinish: (values: any) => void }) {
  const [parceiroObject] = useState<Parceiro>(parceiro);

  const onFinishFailed = (errorInfo: any) => {
    console.error('Failed:', errorInfo);
  };

  return (
    <div className='w-full'>
      <h1 className='pb-8'><strong>Parceiro</strong></h1>
      <Form
        name="service_provider_form"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{
          name: parceiroObject?.name || '',
          email: parceiroObject?.email || '',
          phone: parceiroObject?.telefone || '',
          cnpj: parceiroObject?.cpf_cnpj || '',
          cep: parceiroObject?.metadata.cep || '',
          street: parceiroObject?.metadata.street || '',
          number: parceiroObject?.metadata.number || '',
          neighborhood: parceiroObject?.metadata.neighborhood || '',
          city: parceiroObject?.metadata.city || '',
          state: parceiroObject?.metadata.state || '',
        }}
      >
        {/* Seção de Informações Pessoais */}
        <div>
          <h2><strong>Informações Pessoais</strong></h2>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nome"
                name="name"
                rules={[{ required: true, message: 'Por favor, insira o nome!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Por favor, insira o email!' },
                  { type: 'email', message: 'Por favor, insira um email válido!' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Telefone"
                name="phone"
                rules={[{ required: true, message: 'Por favor, insira o telefone!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="CNPJ"
                name="cnpj"
                rules={[
                  { required: true, message: 'Por favor, insira o CNPJ!' },
                  { pattern: /^\d{14}$/, message: 'Por favor, insira um CNPJ válido (14 dígitos)!' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className='h-8'></div>
        
        {/* Seção de Endereço */}
        <div>
          <h2><strong>Informações de Endereço</strong></h2>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="CEP"
                name="cep"
                rules={[
                  { required: true, message: 'Por favor, insira o CEP!' },
                  { pattern: /^\d{8}$/, message: 'Por favor, insira um CEP válido (8 dígitos)!' },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Rua"
                name="street"
                rules={[{ required: true, message: 'Por favor, insira a rua!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                label="Número"
                name="number"
                rules={[{ required: true, message: 'Por favor, insira o número!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Bairro"
                name="neighborhood"
                rules={[{ required: true, message: 'Por favor, insira o bairro!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Cidade"
                name="city"
                rules={[{ required: true, message: 'Por favor, insira a cidade!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Estado"
                name="state"
                rules={[{ required: true, message: 'Por favor, insira o estado!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            <span className='font-semibold px-8'>Salvar</span>
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

function ServicosList({ servicosList, fetchServicos }: { servicosList: Servico[], fetchServicos: () => void }) {
  const servicos = servicosList;

  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const [selectedServiceId, setSelectedServiceId] = React.useState<number | string | null>(null);

  const showDeleteConfirmation = (id: string) => {
    setSelectedServiceId(id);
    setIsModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    try {

      await deletarServico(selectedServiceId.toString());

      await fetchServicos();

      setIsModalVisible(false);

      setSelectedServiceId(null);
    } catch (error) {
      console.error(error);
      toast.error('Houve um erro ao deletar o serviço!');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedServiceId(null);
  };

  return (
    <div className='w-full'>
      <h2><strong>Serviços Oferecidos</strong></h2>

      <div
        style={{ maxHeight: '500px', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="hide-scrollbar border border-gray-300 rounded-sm p-2"
      >
        <List
          bordered={false}
          dataSource={servicos}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key={item.id}
                  type="link"
                  danger
                  onClick={() => showDeleteConfirmation(item.documentId)}
                >
                  Deletar
                </Button>
              ]}
            >
              <div>
                <strong>{item.name}</strong> | <span title={item.descricao}>{item.descricao.length > 50 ? `${item.descricao.substring(0, 50)}...` : item.descricao}</span> | R$ {item.preco} ({item.genero})
              </div>
            </List.Item>
          )}
        />
      </div>

      <Modal
        title="Confirmar Exclusão"
        visible={isModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleCancel}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <p>Tem certeza que deseja excluir este serviço? Esta ação não poderá ser desfeita.</p>
      </Modal>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, and Opera */
        }
      `}</style>
    </div>
  );
}