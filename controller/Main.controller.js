sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast"
], (Controller, MessageToast) => {
   "use strict";

   return Controller.extend("bookSystem.controller.Main", {
      onInit() {
         // runs when the Main view is created
      },

      async searchBook() {
         const query = this.byId("searchInput").getValue().trim();
         if (!query) {
            MessageToast.show("Digite um título para buscar.");
            return;
         }
        
         try { 
            const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
            //const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${KEY}`
            const response = await fetch(url);
            if (!response.ok) throw new Error(response.statusText);
            const data = await response.json();
            console.log(data);
         } catch (err) {
            MessageToast.show("Erro ao buscar livros: " + query);
         }
      }
   });
});
