  var template = '<!doctype html><div id="habitantes">\n  <input/>\n  <div class="atuais">\n    <h1>Habitantes</h1>\n    <table>\n      <thead>\n        <tr>\n          <th></th>\n          <th></th>\n          <th></th>\n        </tr>\n      </thead>\n      <tbody class="ativos">\n        <tr>\n          <td class="quarto"></td>\n          <td>\n            <a class="nome" data-bind-here="href" data-bind-there="link"></a>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n  <div class="antigos">\n    <h1>habitantes antigos</h1>\n    <table>\n      <thead>\n        <tr>\n          <th></th> \n          <th></th> \n        </tr> \n      </thead>\n      <tbody class="inativos">\n        <tr>\n          <td class="quarto"></td>\n          <td>\n            <a class="nome" data-bind-here="href" data-bind-there="link"></a>\n          </td>\n        </tr>\n      </tbody> \n    </table>\n  </div>\n</div>\n' 
  var data = { 
    ativos: [{ 
      quarto: '213', 
      nome: 'fulano', 
      link: 'fulano.com' 
    },{ 
      quarto: '405', 
      nome: 'beltrano', 
      link: 'beltrano.com' 
    },{ 
      quarto: '414', 
      nome: 'ciclano', 
      link: 'ciclano.com' 
    }], 
    //inativos: [] 
  } 
  
  var res = tempreites.render(template, data)
  
  if (typeof document === 'undefined') console.log(res) 
  else document.getElementById('main').innerHTML = res 


  var template = '<div id="habitante">\n  <div id="dados">\n    <h1 id="nome"></h1>\n    <h1 id="quarto"></h1>\n    <ul>\n      <li>dia do vencimento: <span id="vencimento_dia"></span></li>\n      <li>cpf: <span id="cpf"></span></li>\n      <li>telefone: <span id="telefone"></span></li>\n    </ul>\n    <div id="estada">\n      <a data-bind-here="href" data-bind-there="prevlink">estada anterior</a>\n      <ul>\n        <li>quarto: <span class="quarto"></span></li>\n        <li>entrada: <span class="entrada"></span></li>\n        <li>sa\xc3\xadda: <span class="saida"></span></li>\n      </ul>\n      <a data-bind-here="href" data-bind-there="nextlink">estada seguinte</a>\n    </div>\n  </div>\n  <div id="boletos">\n    <table>\n      <thead>\n        <tr>\n          <th>m\xc3\xaas</th>\n          <th>total</th>\n          <th>pago</th>\n          <th>em aberto</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr>\n          <td class="mes"></td>\n          <td class="total"></td>\n          <td class="pago"></td>\n          <td class="em_aberto"></td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n  <div id="action">\n    <form class="pure-form saida">\n      <fieldset>\n        <input type="text" class="datepicker" name="dia">       <button type="submit" class="pure-button">saiu do quarto</button>\n      </fieldset>\n    </form>\n  </div>\n</div>\n<div id="_id"></div>\n'
  var doc = {"_id":"e7e1a61e-61b3-11e2-877c-00e04d49d684","_rev":"1-5d60c795b1257e1ae42818a344bf9451","vencimento":5,"estadas":[{"entrada":"2012-06-18","quarto":"8"},{"entrada":"2012-06-18","quarto":"8"}],"type":"habitante","nome":"Marcos Luiz","_revisions":{"start":1,"ids":["5d60c795b1257e1ae42818a344bf9451"]},"quarto":"8","estada":{"entrada":"2012-06-18","quarto":"8"},"prevlink":"?estada=[object Object]","nextlink":null}

  var res = tempreites.render(template, doc)

  if (typeof document === 'undefined') console.log(res) 
  else document.getElementById('main').innerHTML = res 

