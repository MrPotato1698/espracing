"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface FAQItem {
  id: string
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "¿Cada cuanto son las carreras?",
    answer: "En ESP Racing, las carreras se realizan de manera quincenal, los domingos a las 17:30 hora peninsular española, siempre y cuando no se diga lo contrario. Este es el horario oficial, pero puede variar según a petición de los corredores dependiendo si coincidimos con una carrera de Fórmula 1, o algún tipo de eventos que pueda modificar la participación a la carrera.",
  },
  {
    id: "2",
    question: "¿Cuánto cuesta correr con vosotros?",
    answer: "Nada, correr con nosotros es totalmente gratis. Tanto el acceso al contenido como al servidor es 100% gratis. Eso no implica que aceptemos ayudas económicas de los corredores cuando ellos quieran; son totalmente bienvenidas, vienen de la voluntad de los propios corredores, y no hay ninguna obligatoriedad de aportar nada. Tenemos una cuenta de PayPal, donde aceptamos dichas donaciones en la parte superior de esta web.",
  },
  {
    id: "3",
    question: "¿Dónde puedo acceder a vuestros servidores? ¿Y vuestro contenido?",
    answer: "A nuestros servidores se accede desde nuestro Discord, que tienes un enlace en la parte superior de la web, o también en la parte inferior. Pasa absolutamente igual con el contenido para correr con nosotros. En ESP damos todo el contenido para correr, y para que esté bien organizado, se encuentra en estos momentos en el centro neurálgico de ESP Racing, que es nuestro server de Discord.",
  },
  {
    id: "4",
    question: "Tengo problemas para entrar al servidor, y no puedo rodar, ¿qué puedo hacer?",
    answer: "Lo más recomendable es acudir a nuestro Discord, y preguntar por nuestro canal de Discord de 'dudas y preguntas', donde uno de los administradores, o incluso otro usuario, sabrá cómo ayudarte en el problema.",
  },
  {
    id: "5",
    question: "¿Se sabe cuáles son los próximos campeonatos?",
    answer: "Los próximos campeonatos solo lo sabe la administración. No nos gusta adelantar mucha información al respecto de futuros proyectos, ya que en muchas ocasiones estos cambian mucho desde la primera concepción, y no queremos dar falsas expectativas. Pero siempre, la semana previa al anuncio de un nuevo campeonato, vamos soltando pequeños 'spoilers' de los circuitos, y posibles coches que pueden ser de próximo campeonato.",
  },
]

export function FAQSection() {
  const [openItem, setOpenItem] = React.useState<string | null>(null)

  const handleToggle = (itemId: string) => {
    setOpenItem(openItem === itemId ? null : itemId)
  }

  return (
    <div className="w-full max-w-11/12 mx-auto space-y-4">
      <div className="text-center mb-8">
        <h1 className="py-5 text-3xl font-extrabold text-lightPrimary sm:text-5xl">Preguntas Frecuentes</h1>
        <p className="text-lightSecond text-md sm:text-lg">
          Encuentra respuestas a las preguntas más comunes sobre ESP Racing
        </p>
      </div>

      {faqData.map((item) => (
        <Collapsible key={item.id} open={openItem === item.id} onOpenChange={() => handleToggle(item.id)}>
          <div className="border border-primary rounded-lg overflow-hidden bg-darkSecond">
            <CollapsibleTrigger className="flex w-full items-center justify-between p-6 text-left hover:bg-darkPrimary transition-colors">
              <h3 className="text-lg font-semibold text-lightPrimary">{item.question}</h3>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                  openItem === item.id ? "transform rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 pb-6">
              <div className="pt-2 border-t border-primary/30">
                <p className="text-lightSecond leading-relaxed">{item.answer}</p>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  )
}
