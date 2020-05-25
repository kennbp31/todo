const electron = require('electron');
        const {ipcRenderer} = electron;
        const ul = document.querySelector('ul');
        
        // Recieving item to add to the HTML page, and add it
        ipcRenderer.on('item:load', function(e, rows){
            ul.className = 'collection'
            ul.innerHTML = ""
            for (row of rows){
                var li = document.createElement('li');
                li.innerHTML = row.item.toString();
                li.ondblclick = remove;
                var lid = 'list_' + row.lid;
                li.id = lid;
                li.className = 'collection-item'
                ul.appendChild(li);
            }
            if (!ul.firstChild){
                ul.className = "";
            };
        });

        // Clear all list items from the page
        ipcRenderer.on('item:clear', function(){
            while(ul.firstChild){
                ul.removeChild(ul.lastChild);
                ul.className = "";
            };
        });

        // remove item
        function remove(){
            var item = this.id;
            item = item.substring(5, item.length)
            ipcRenderer.send('item:remove', item)
            this.remove(this);
            if (!ul.firstChild){
                ul.className = "";
            };
        };