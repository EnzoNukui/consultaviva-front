import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Error from "./Error";
import Home from "./institucional/Home";

export const linksInstitucionais = [
  { texto: "Home", caminho: "/" },
  { texto: "Sobre", caminho: "/sobre" },
  { texto: "Solução", caminho: "/solucao" },
  { texto: "Integrantes", caminho: "/integrantes" },
  { texto: "FAQ", caminho: "/faq" },
  { texto: "Contato", caminho: "/contato" },
] as const;

// Carrega cada página apenas quando a rota é acessada, reduzindo o bundle inicial.
const carregar = (importar: () => Promise<{ default: ComponentType }>) => async () => {
  const modulo = await importar();
  return { Component: modulo.default };
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/sobre",
        lazy: carregar(() => import("./institucional/Sobre")),
      },
      {
        path: "/solucao",
        lazy: carregar(() => import("./institucional/Solucao")),
      },
      {
        path: "/integrantes",
        lazy: carregar(() => import("./institucional/Integrantes")),
      },
      {
        path: "/integrantes/:rm",
        lazy: carregar(() => import("./institucional/Integrantes")),
      },
      {
        path: "/contato",
        lazy: carregar(() => import("./institucional/Contato")),
      },
      {
        path: "/faq",
        lazy: carregar(() => import("./institucional/Faq")),
      },
    ],
  },
  {
    path: "/acesso",
    lazy: carregar(() => import("./acesso/Acesso")),
    errorElement: <Error />,
  },
  {
    path: "/cadastro",
    lazy: carregar(() => import("./acesso/CadastroPaciente")),
    errorElement: <Error />,
  },
  {
    path: "/paciente",
    lazy: carregar(() => import("../components/LayoutPaciente/LayoutPaciente")),
    errorElement: <Error />,
    children: [
      {
        path: "/paciente",
        lazy: carregar(() => import("./paciente/InicioPaciente")),
      },
      {
        path: "/paciente/consultas",
        lazy: carregar(() => import("./paciente/ConsultasPaciente")),
      },
      {
        path: "/paciente/consultas/:id",
        lazy: carregar(() => import("./paciente/DetalhesConsulta")),
      },
      {
        path: "/paciente/solicitacoes",
        lazy: carregar(() => import("./paciente/SolicitacoesPaciente")),
      },
      {
        path: "/paciente/solicitacoes/:id",
        lazy: carregar(() => import("./paciente/DetalhesSolicitacao")),
      },
      {
        path: "/paciente/propostas",
        lazy: carregar(() => import("./paciente/PropostasPaciente")),
      },
      {
        path: "/paciente/preparo-virtual",
        lazy: carregar(() => import("./paciente/PreparoVirtual")),
      },
    ],
  },
  {
    path: "/equipe",
    lazy: carregar(() => import("../components/LayoutEquipe/LayoutEquipe")),
    errorElement: <Error />,
    children: [
      {
        path: "/equipe",
        lazy: carregar(() => import("./equipe/InicioEquipe")),
      },
      {
        path: "/equipe/pacientes",
        lazy: carregar(() => import("./equipe/PacientesEquipe")),
      },
      {
        path: "/equipe/unidades",
        lazy: carregar(() => import("./equipe/UnidadesEquipe")),
      },
      {
        path: "/equipe/horarios",
        lazy: carregar(() => import("./equipe/HorariosEquipe")),
      },
      {
        path: "/equipe/agendamentos",
        lazy: carregar(() => import("./equipe/AgendamentosEquipe")),
      },
      {
        path: "/equipe/solicitacoes",
        lazy: carregar(() => import("./equipe/SolicitacoesEquipe")),
      },
      {
        path: "/equipe/solicitacoes/:id",
        lazy: carregar(() => import("./equipe/AnaliseSolicitacao")),
      },
      {
        path: "/equipe/propostas",
        lazy: carregar(() => import("./equipe/PropostasEquipe")),
      },
    ],
  },
]);

export default router;
