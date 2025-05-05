"use client";

import React, { useEffect, useState } from "react";
import { Table as AntTable, Input, Button, Dropdown, MenuProps, Modal } from "antd";
import Link from "next/link";
import { toast } from "react-toastify";
import { getFormularios, deleteFormulario } from "@/services";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { MoreOutlined } from "@ant-design/icons";
import { copyToClipboard } from "@/utils";

export default function Forms() {
  const [searchText, setSearchText] = useState("");
  const [formularios, setFormularios] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const router = useRouter();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const fetchForms = async () => {
    try {
      const response = await getFormularios({
        populate: "*",
      });
      setFormularios(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar serviços");
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDelete = async () => {
    if (!selectedRecord) return;
    try {
      await deleteFormulario(selectedRecord.documentId);
      toast.success("Formulário excluído com sucesso!");
      fetchForms();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir formulário");
    } finally {
      setIsModalOpen(false);
      setSelectedRecord(null);
    }
  };

  const showDeleteModal = (record: any) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleShare = (documentId: string) => {
    const shareUrl = `http://localhost:3000/public/${documentId}`;
    copyToClipboard(shareUrl);
    toast.success("Link copiado para a área de transferência!");
  };

  const getMenuItems = (record: any): MenuProps["items"] => [
    { key: "editar", label: "Editar", onClick: () => router.push(`/formularios/${record.documentId}`) },
    { key: "excluir", label: "Excluir", onClick: () => showDeleteModal(record) },
    { key: "detalhes", label: "Ver detalhes", onClick: () => router.push(`/formularios/${record.documentId}`) },
    { key: "compartilhar", label: "Compartilhar", onClick: () => handleShare(record.documentId) },
  ];

  const columns: ColumnsType<any> = [
    { title: "ID", key: "id", dataIndex: "documentId" },
    { title: "Nome", key: "name", dataIndex: "nome" },
    { title: "Descrição", key: "descricao", dataIndex: "descricao" },
    { title: "Serviços relacionados", key: "formulario_opcaos_length", dataIndex: "formulario_opcaos_length" },

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

  const filteredData = formularios
    .map(item => ({ ...item, key: item.id, formulario_opcaos_length: item.formulario_opcaos.length }))
    .filter((item) =>
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

        <Button type="primary">
          <Link href={"/formularios/create"}><span className="font-semibold px-8">Adicionar</span></Link>
        </Button>
      </div>

      <div className="border-b-red-500 border-b-2 mb-4">
        <h1 className="text-lg font-semibold">Formulário</h1>
      </div>

      <AntTable
        columns={columns}
        dataSource={filteredData}
        pagination={{
          pageSize: 10,
        }}
      />
      <Modal
        title="Confirmar Exclusão"
        open={isModalOpen}
        onOk={handleDelete}
        onCancel={() => setIsModalOpen(false)}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <p>Tem certeza que deseja excluir este formulário? Esta ação não poderá ser desfeita.</p>
      </Modal>
    </div>
  );
};
