import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { deleteFormularioOpcao, deletePlanoServico, deleteServico, getFormularioOpcaos, getPlanoServicos } from './services';

export default function withAuth(Component: any, allowedRoles: string[]) {
  return function ProtectedPage(props: any) {
    const router = useRouter();
    const userRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;

    useEffect(() => {
      if (!userRole || !allowedRoles.includes(userRole)) {
        router.push('/login');
      }
    }, [userRole]);

    return allowedRoles.includes(userRole) ? <Component {...props} /> : null;
  };
}

export const convertToBRL = (value: number) => {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(
    () => {
    },
    (err) => {
      console.error("Erro ao copiar texto para a área de transferência:", err);
    }
  );
};

export const formatPhoneNumber = (value: string) => {
  const onlyNumbers = value.replace(/\D/g, "");
  return onlyNumbers
    .replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3")
    .slice(0, 15);
};


export interface CalculateProfit {
  collaboratorPrice: number,
  partnerPrice: number,
  profit: number
}

export const calculate = (price: number, transferPercent: number, collaboratorPercent: number): CalculateProfit => {
  const transferPercentage = Number(transferPercent ?? 0) / 100;
  const collaboratorPercentage = Number(collaboratorPercent ?? 0) / 100;

  const collaboratorPrice = price - price * collaboratorPercentage;
  const partnerPrice = collaboratorPrice * (1 - transferPercentage);
  const profit = collaboratorPrice * transferPercentage;

  return {
    collaboratorPrice,
    partnerPrice,
    profit,
  }
};

export const deletarServico = async (id: string) => {
  try {
    const optionsReponse = await getFormularioOpcaos({
      populate: "*",
      filters: {
        servico: {
          documentId: {
            $eq: id.toString(),
          },
        },
      },
    });
  
    const planosReponse = await getPlanoServicos({
      populate: "*",
      filters: {
        servico: {
          documentId: {
            $eq: id.toString(),
          },
        },
      },
    });
    
    await Promise.all(optionsReponse.data.data.map(async (item: any) => await deleteFormularioOpcao(item.documentId)));
    await Promise.all(planosReponse.data.data.map(async (item: any) => await deletePlanoServico(item.documentId)));
  
    await deleteServico(id);
    
  } catch (error) {
    console.log(error);
  }
}
