var builder=require('botbuilder');
var restify = require('restify');//web server restify
var emoji=require('node-emoji');
//crear servidor
var server= restify.createServer();
// se escucha en diferentes puertos , particularment en el puerto 3978
server.listen(process.env.port || process.env.PORT || 3978, function(){
  console.log('%s listening to %s', server.name,server.url);
});

var connector = new builder.ChatConnector({
    appId:'',
    appPassword:''
});


server.post('api/messages', connector.listen());
var bot = new builder.UniversalBot(connector,[
    function(session){
     session.userData.cliente=null;

        session.send(emoji.get('hand')+' Hola bienvenido al Restaurante tipico colombia '+emoji.get('point_left'));
        session.beginDialog('/inicio');
    }
]);
// dialogos
bot.dialog('/inicio',[// primer dialogo se crea dentro del bot
    
    function(session,results,next){
        if(!session.userData.cliente){ //preguntar si sabemos el nombre
            builder.Prompts.text(session, 'Cual es su nombre?');
        }else{
            next(); //Pasar al siguiente metodo de la cascada llamada next
        }
    },
    function (session,results){
        if(results.response){
            let msj = results.response;
            session.userData.cliente = msj;            
        }
        
        session.send(`hola ${session.userData.cliente} ${emoji.get('smiley')}`);
        session.beginDialog('/preguntaReserva');
        
    }
    ]);

    bot.dialog('/preguntaReserva',[// primer dialogo se crea dentro del bot
        function(session){
            builder.Prompts.text(session,` Señor(@) ${session.userData.cliente} desea realizar una reserva?`);          
        },
        function(session, results){
            let reserv = results.response;
            if(reserv=='si' || reserv=='Si' || reserv=='SI' || reserv=='sI'){
             //session.beginDialog('/preguntarclima');
             session.replaceDialog('/preguntaFecha');
            }else{
                session.endConversation(`Gracias por utilizar nuestro sistema de reservas`);
                
            }
        }
        ]);

        bot.dialog('/preguntaFecha',[// primer dialogo se crea dentro del bot
            
            function(session,results,next){// objeto llamado sesiòn
                
                if(!session.conversationData.fecha){
                    builder.Prompts.text(session,`Por favor confirme la fecha de la reserva ${emoji.get('calendar')}`);
                }else{
                    next();
                }
            },
            function (session,results){
                if(results.response){
                    //let sitio = results.response;
                    session.conversationData.fecha = results.response;
                }
                session.beginDialog('/preguntanpersonas');
            } 
            ]);
            bot.dialog('/preguntanpersonas', [ //método 
                function(session,results,next){// 
                    
                    if(!session.conversationData.nper){
                        builder.Prompts.text(session, `Para cuantas personas es la reserva? ${emoji.get('family')}`);
                    }else{
                        next();
                    }
                },
                function (session,results){
                    if(results.response){
                        //let sitio = results.response;
                        session.conversationData.nper = results.response;
                    }
            
                    session.beginDialog('/preguntanmenu');
                }
            ]);
            bot.dialog('/preguntanmenu', [ //método 
                function(session,results,next){// 
                    
                    if(!session.conversationData.menu){
                        builder.Prompts.text(session, `Que menu se reservará? ${emoji.get('coffee')}`);
                    }else{
                        next();
                    }
                },
                function (session,results){
                    if(results.response){
                        //let sitio = results.response;
                        session.conversationData.menu = results.response;
                    }
            
                    session.beginDialog('/mostrarSalida');
                }
            ]);
            bot.dialog('/mostrarSalida', [ //método preguntar lugar

                function (session, results){
                     session.send(` Reserva confirmada.. detalles de la reserva : <br/> fecha: ${session.conversationData.fecha} <br/> # personas: ${session.conversationData.nper} <br/> Menú: ${session.conversationData.menu} `)
                    }
            ]);