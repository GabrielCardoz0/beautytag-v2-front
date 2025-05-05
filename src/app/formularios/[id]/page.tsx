"use client";

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, Space, Card } from 'antd';
import { getFormularioById, updateFormulario, getServicos, updateFormularioOpcao, getFormularioOpcaos, createFormularioOpcao, deleteFormularioOpcao } from '@/services'; // Importação adicionada
import { toast } from 'react-toastify';
import { convertToBRL } from '@/utils';
import { useRouter, useParams } from 'next/navigation';

interface Option {
  id: number | string;
  service: string;
  subOptions: string[];
  isDeleted?: boolean; // Campo adicionado
}

const EditFormPage = () => {
  const [options, setOptions] = useState<Option[]>([]);
  const [servicos, setServicos] = useState([]);
  const [form] = Form.useForm();
  const router = useRouter();
  const { id } = useParams();

  const addOption = () => {
    setOptions([...options, { id: Date.now(), service: "", subOptions: [], isDeleted: false }]); // Usando timestamp com Date.now()
  };

  const removeOption = async (id) => {
    const newList = options.filter(option => {
      if (typeof option.id === "number" && option.id === id) return false;
      return option.id !== id || (option.id === id && !(option.isDeleted = true));
    });

    setOptions(newList);
  };

  const handleServiceChange = (id, value) => {
    const isDuplicate = options.some(option => option.service === value && option.id !== id);
    if (isDuplicate) {
      toast.error("Este serviço já foi selecionado em outra opção.");
      return;
    }

    setOptions(prevOptions =>
      prevOptions.map(option =>
        option.id === id ? { ...option, service: value } : option
      )
    );
  };

  const handleSubOptionChange = (id, value) => {
    setOptions(prevOptions =>
      prevOptions.map(option =>
        option.id === id ? { ...option, subOptions: value } : option
      )
    );
  };

  const fetchServicos = async () => {
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

  const fetchFormulario = async () => {
    try {
      const response = await getFormularioById(id.toString());

      const optionsReponse = await getFormularioOpcaos({
        populate: "*",
        filters: {
          formulario: {
            documentId: {
              $eq: id.toString(),
            },
          },
        },
      });

      if (response?.data?.data && optionsReponse?.data.data) {
        const formulario = response.data.data;
        const optionList = optionsReponse.data.data;

        form.setFieldsValue({
          formName: formulario.nome,
          formDescription: formulario.descricao,
        });

        setOptions(optionList.map(opcao => ({
          id: opcao.documentId,
          service: opcao.servico.documentId,
          subOptions: opcao.servicos_secundarios.map(sub => sub.documentId),
          isDeleted: false, // Inicializa como não deletado
        })));
      } else {
        toast.error("Formulário não encontrado");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar formulário");
    }
  };

  const updateForm = async (values) => {
    try {
      const hasEmptyService = options.some(option => !option.service);
      if (hasEmptyService) {
        toast.error("Por favor, selecione um serviço para todas as opções.");
        return;
      }

      await updateFormulario(id.toString(), {
        data: {
          nome: values.formName,
          descricao: values.formDescription,
        }
      });

      for (const option of options) {
        if (option.isDeleted) {
          await deleteFormularioOpcao(option.id);
          continue;
        }

        const payload = {
          servico: option.service,
          servicos_secundarios: option.subOptions,
          formulario: id.toString(),
        };

        if (typeof option.id === "number") {
          await createFormularioOpcao({ data: payload });
        } else {
          await updateFormularioOpcao(option.id, { data: payload });
        }
      }

      toast.success("Formulário atualizado com sucesso!");
      router.push("/formularios");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar formulário");
    }
  };

  useEffect(() => {
    fetchServicos();
    fetchFormulario();
  }, []);

  return (
    <div className='w-full p-4'>
      <Card title="Editar Formulário de Serviços" style={{ width: 800, margin: '0 auto' }}>
        <Form layout="vertical" form={form} onFinish={updateForm}>
          <Form.Item label="Nome do Formulário" name="formName" rules={[{ required: true, message: 'Por favor, insira o nome do formulário!' }]}>
            <Input placeholder="Digite o nome do formulário" />
          </Form.Item>

          <Form.Item label="Descrição do Formulário" name="formDescription" rules={[{ required: true, message: 'Por favor, insira a descrição do formulário!' }]}>
            <Input.TextArea placeholder="Digite a descrição do formulário" rows={4} />
          </Form.Item>

          {options.length > 0 && options.map(option => (
            <Space key={option.id} direction="vertical" style={{ display: 'flex', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Form.Item label="Serviço" style={{ flex: 1 }} rules={[{ required: true, message: 'Por favor, selecione um serviço!' }]}>
                  <Select
                    placeholder="Selecione um serviço"
                    value={option.service} // Certificar-se de que o valor está correto
                    onChange={(value) => handleServiceChange(option.id, value)}
                    options={servicos.map(servico => ({
                      value: servico.documentId,
                      label: `${servico.name} - ${convertToBRL(servico.preco)}`,
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
                  value={option.subOptions} // Certificar-se de que o valor está correto
                  onChange={(value) => handleSubOptionChange(option.id, value)}
                  options={servicos.map(servico => ({
                    value: servico.documentId,
                    label: `${servico.name} - ${convertToBRL(servico.preco)}`,
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
              <span className='font-semibold px-8'>Salvar Alterações</span>
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditFormPage;
