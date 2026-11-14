import Botoes from '../../components/Botoes/Botoes'

export default function Error() {
  return (
    <section className="mx-auto max-w-7xl space-y-4 px-5 py-16 sm:px-8">
      <h1>Página não encontrada</h1>
      <Botoes texto="Voltar para a Home" para="/" />
    </section>
  )
}
