var easy = require('libxmljs-easy')

var html = '<div id="habitantes">\n  <div class="atuais">\n    <h1>Habitantes</h1>\n    <table>\n      <thead>\n        <tr>\n          <th></th>\n          <th></th>\n          <th></th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr class="ativos">\n          <td class="quarto"></td>\n          <td>\n            <a class="nome" href="#"></a>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n  <div class="antigos">\n    <h1>habitantes antigos</h1>\n    <table>\n      <thead>\n        <tr>\n          <th></th>\n          <th></th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr class="inativos">\n          <td class="quarto"></td>\n          <td>\n            <a class="nome" href="#"></a>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n</div>'

var topnode = easy.parse()
