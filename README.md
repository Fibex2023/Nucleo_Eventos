# Nucleo_Eventos
git clone https://oauth2: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@github.com/Fibex2023/Nucleo_Eventos.git
https://github.com/settings/tokens
Exp 14/02


npm run build

Prueba SendMessage
query Query($abonado: String!, $tipoMensaje: String!, $app: String!, $mensaje: String!) 
{
    sendMessage(abonado: $abonado, tipo_mensaje: $tipoMensaje, app: $app, mensaje: $mensaje)
}
DATOS:
{  
  "abonado": "1515",
  "tipoMensaje": "4",  
  "app": "api",
  "mensaje": "{ app: 1 }"  
}