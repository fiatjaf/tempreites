var template = '<div id="habitantes">\n  <input/>\n  <div class="atuais">\n    <h1>Habitantes</h1>\n    <table>\n      <thead>\n        <tr>\n          <th></th>\n          <th></th>\n          <th></th>\n        </tr>\n      </thead>\n      <tbody class="ativos">\n        <tr>\n          <td class="quarto"></td>\n          <td>\n            <a class="nome" data-bind-here="href" data-bind-there="link"></a>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n  <div class="antigos">\n    <h1>habitantes antigos</h1>\n    <table>\n      <thead>\n        <tr>\n          <th></th> \n          <th></th> \n        </tr> \n      </thead>\n      <tbody class="inativos">\n        <tr>\n          <td class="quarto"></td>\n          <td>\n            <a class="nome" data-bind-here="href" data-bind-there="link"></a>\n          </td>\n        </tr>\n      </tbody> \n    </table>\n  </div>\n</div>\n' 
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

res = tempreites.render(template, data)

if (typeof document === 'undefined') console.log(res) 
else document.getElementById('main').innerHTML = res 
