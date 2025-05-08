"use client";

import React, { useEffect, useState } from "react";
import { Table as AntTable, Button, Dropdown, Input, Modal, List, MenuProps } from "antd";
import { ColumnsType } from "antd/es/table";
import { MoreOutlined } from "@ant-design/icons";
import { deletePlano, deletePlanoServico, deleteUser, getUsers, updatePlano } from "@/services";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import moment from "moment";
import { convertToBRL } from "@/utils";

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

interface Role {
  id: number;
  documentId: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

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
  telefone: string;
  metadata: Metadata;
  name: string;
  plano: Plano;
  role: Role;
  servicos: any[];
}

export default function Colaboradores() {
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isServicesModalVisible, setIsServicesModalVisible] = useState(false);
  const [modalData, setModalData] = useState<PlanoServico[]>([]);
  const [selectedColab, setSelectedColab] = useState<Colaborador>(null);
  const [colabs, setColabs] = useState<Colaborador[]>([]);

  const router = useRouter();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleViewServices = (record: Colaborador) => {
    const list = record?.plano?.plano_servicos ?? [];
    setModalData(list);
    setIsServicesModalVisible(true);
  };

  const handleServiceModalClose = () => {
    setIsServicesModalVisible(false);
    setModalData([]);
  };

  const handleDelete= (record: any) => {
    setSelectedColab(record);
    setIsModalVisible(true);
  }

  const handleConfirmDelete = async () => {
    try {
      
      await deleteUser(selectedColab.id);
      await deletePlano(selectedColab.plano.documentId);
      await Promise.all(selectedColab?.plano?.plano_servicos?.map(async (servico: PlanoServico) => await deletePlanoServico(servico.documentId)));

      setIsModalVisible(false);
      toast.success("Colaborador excluído com sucesso!");
      fetchColaboradores();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir o colaborador!");
    }
  };

  const handleCancelDelete = () => {
    setIsModalVisible(false);
    setSelectedColab(null);
  };

  const fetchColaboradores = async () => {
    try {
      const response = await getUsers({
        "filters[role][$eq]": 5,
        // "populate": "*",
        populate: ["plano.plano_servicos.servico", "role", "servicos"],

      });

      setColabs(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Houve um erro ao buscar os colaboradores!");
    }
  };

  const togglePagamento = async (record: Colaborador) => {
    try {
      await updatePlano(record.plano.documentId, {
        data: {
          is_pago: !record.plano.is_pago
        }
      });
      await fetchColaboradores();
      toast.success("Status de pagamento atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar o status de pagamento!");
    }
  };

  useEffect(() => {
    fetchColaboradores();
  }, []);

  const getMenuItems = (record: any): MenuProps["items"] => [
    { key: "editar", label: "Editar", onClick: () => router.push(`/colaboradores/${record.id}`) },
    { key: "excluir", label: "Excluir", onClick: () => handleDelete(record) },
    { key: "detalhes", label: "Ver detalhes", onClick: () => router.push(`/colaboradores/${record.id}`) },
  ];

  const columns: ColumnsType<Colaborador> = [
    { title: "Nome", key: "name", dataIndex: "name" },
    { title: "CPF", key: "cpf", dataIndex: "cpf_cnpj" },
    { title: "Email", key: "email", dataIndex: "email" },
    { title: "Telefone", key: "telefone", dataIndex: "telefone" },
    { title: "CEP", key: "cep", dataIndex: "metadata", render: (metadata) => metadata?.cep || "Não informado" },
    { title: "Data de Nascimento", key: "data_nascimento", dataIndex: "metadata", render: (metadata) => moment(metadata?.data_nascimento).format("DD.MM.YYYY") || "Não informado" },
    { title: "Gênero", key: "genre", dataIndex: "metadata", render: (metadata) => metadata?.genero || "Não informado" },
    { title: "Empresa", key: "empresa", dataIndex: "metadata", render: (metadata) => metadata?.empresa || "Não informado" },
    {
      title: "Pagamento",
      key: "pagamento",
      dataIndex: "plano",
      render: (_, record) => (
        <Button
          type={record.plano.is_pago ? "primary" : "default"}
          onClick={() => togglePagamento(record)}
        >
          {record.plano.is_pago ? "SIM" : "NÃO"}
        </Button>
      ),
    },
    { 
      title: "Total do Plano", 
      key: "total_plano", 
      dataIndex: "plano",
      render: ((plano) => {
        const planTotal = plano.plano_servicos.reduce((sum: number, service: PlanoServico) => sum + ( service.frequencia_value * service.servico.preco_colab ), 0);
        return convertToBRL(planTotal ?? 0);
      })
    },
    {
      title: "Serviços",
      key: "servicos",
      dataIndex: "servicos",
      render: (_, record) => (
        <a onClick={() => handleViewServices(record)}>
          Ver serviços
        </a>
      ),
    },
    {
      title: "Opções",
      key: "options",
      render: (_, record) => (
        <Dropdown
          menu={{ items: getMenuItems(record) }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];


  const filteredData = colabs.map(item => ({
    ...item, 
    key: item.id, 
    nome: item.name, 
  })).filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  return (
    <div className="w-full p-4">

      <div className="w-full flex justify-between">
        <Input
          placeholder="Buscar..."
          value={searchText}
          onChange={handleSearch}
          style={{ marginBottom: 16, width: 300 }}
        />
      </div>

      <div className="border-b-red-500 border-b-2 mb-4">
        <h1 className="text-lg font-semibold">Colaboradores</h1>
      </div>

      <AntTable
        columns={columns}
        dataSource={filteredData}
        pagination={{
          pageSize: 10,
          pageSizeOptions: ["1", "2", "3"],
        }}
      />
      <Modal
        title="Serviços"
        open={isServicesModalVisible}
        onCancel={handleServiceModalClose}
        footer={[
          <Button key="close" onClick={handleServiceModalClose}>
            Fechar
          </Button>,
        ]}
      >
        <List
          dataSource={modalData}
          renderItem={(item: PlanoServico) => <List.Item>{item.servico.name} - {convertToBRL(item.frequencia_value * item.servico.preco_colab)} ({item.frequencia} x {convertToBRL(item.servico.preco_colab ?? 0)})</List.Item>}
        />
      </Modal>

      <Modal
        title="Confirmar Exclusão"
        open={isModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Excluir"
        cancelText="Cancelar"
      >
        <p>
          Tem certeza que deseja excluir este parceiro? Todos os serviços
          associados a ele serão apagados e esta ação não poderá ser desfeita.
        </p>
      </Modal>
    </div>
  );
};
