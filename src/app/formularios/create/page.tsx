"use client";

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Space, Card } from 'antd';
import { createFormulario, createFormularioOpcao, getServicos } from '@/services';
import { toast } from 'react-toastify';
import { convertToBRL } from '@/utils';
import { useRouter } from 'next/navigation';

interface Option {
  id: number;
  service: string;
  subOptions: string[];
}

const CreateFormPage = () => {
  const [options, setOptions] = useState<Option[]>([{ id: Date.now(), service: "", subOptions: [] }]);
  const [servicos, setServicos] = useState([]);
  const router = useRouter();

  const addOption = () => {
    setOptions([...options, { id: Date.now(), service: "", subOptions: [] }]);
  };

  const removeOption = (id) => {
    setOptions(options.filter(option => option.id !== id));
  };

  const handleServiceChange = (id, value) => {
    setOptions(options.map(option => option.id === id ? { ...option, service: value } : option));
  };

  const handleSubOptionChange = (id, value) => {
    setOptions(options.map(option => option.id === id ? { ...option, subOptions: value } : option));
  };

  const fetchServiços = async () => {
    try {
      const response = await getServicos({});
      if (response?.data?.data) {
        setServicos(response.data.data);
      } else {
        setServicos([]);
        toast.error("Nenhum serviço encontrado");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar serviços");
    }
  };

  const createForm = async (values) => {
    try {
      const createdForm = await createFormulario({
        data: {
          nome: values.formName,
          descricao: values.formDescription,
        }
      });

      await Promise.all(options.map(async (option) => {
        await createFormularioOpcao({
          data: {
            servico: option.service,
            servicos_secundarios: option.subOptions,
            formulario: createdForm.data.data.documentId,
          }
        })
      }));

      toast.success("Formulário criado com sucesso!");
      router.push("/formularios");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar formulário");
    }
  }

  useEffect(() => { fetchServiços() }, []);

  return (
    <div className='w-full p-4'>
      <Card title="Criar Formulário de Serviços" style={{ width: 800, margin: '0 auto' }}>
        <Form layout="vertical" onFinish={createForm}>
          <Form.Item label="Nome do Formulário" name="formName" rules={[{ required: true, message: 'Por favor, insira o nome do formulário!' }]}>
            <Input placeholder="Digite o nome do formulário" />
          </Form.Item>

          <Form.Item label="Descrição do Formulário" name="formDescription" rules={[{ required: true, message: 'Por favor, insira a descrição do formulário!' }]}>
            <Input.TextArea placeholder="Digite a descrição do formulário" rows={4} />
          </Form.Item>

          {options.map(option => (
            <Space key={option.id} direction="vertical" style={{ display: 'flex', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Form.Item label="Serviço" style={{ flex: 1 }} rules={[{ required: true, message: 'Por favor, selecione um serviço!' }]}>
                  <Select
                    placeholder="Selecione um serviço"
                    onChange={(value) => handleServiceChange(option.id, value)}
                    options={servicos.map(servico => ({
                      value: servico.documentId,
                      label: `${servico.name} - ${convertToBRL(servico.preco ?? 0)}`,
                    }))}
                  />
                </Form.Item>
                <Button type="link" danger onClick={() => removeOption(option.id)}>
                  Remover
                </Button>
              </div>

              <Form.Item label="Opções Secundárias" rules={[{ required: true, message: 'Por favor, selecione as opções secundárias!' }]}>
                <Select
                  mode="multiple"
                  placeholder="Selecione as opções secundárias"
                  onChange={(value) => handleSubOptionChange(option.id, value)}
                  options={servicos.map(servico => ({
                    value: servico.documentId,
                    label: `${servico.name} - ${convertToBRL(servico.preco ?? 0)}`,
                  }))}
                />
              </Form.Item>
            </Space>
          ))}

          <Button type="dashed" onClick={addOption} style={{ width: '100%' }}>
            Adicionar Opção
          </Button>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit">
              <span className='font-semibold px-8'>Salvar Formulário</span>
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateFormPage;
