let descriptionEdit = document.getElementById("descriptionEdit");
let amountEdit = document.getElementById("amountEdit");
let dateEdit = document.getElementById("dateEdit");
let indexArray = 0;

const Modal = {
    open(){
        //Abrir o modal e adicionar a class active do modal
        document.querySelector(".modal-overlay").classList.add("active");
    },
    close(){
        //Fechar o modal e remover a class active do modal
        document.querySelector(".modal-overlay").classList.remove("active");
    }
}

const ModalEdit = {
    open(){
        document.querySelector("#modalEdit").classList.add("active");
    },
    close(){
        document.querySelector("#modalEdit").classList.remove("active");
    }
}

const SaveStorage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances")) || [];
    },

    set(transactions){
        localStorage.setItem("dev.finances", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: SaveStorage.get(),
    add(transaction){
        Transaction.all.push(transaction);
        App.reload();
    },

    addEdit(transaction){
        const editTransaction = transaction;
        const newEdit = Transaction.all.map((transaction, index) => {
            if(indexArray === index){
                transaction.description = editTransaction.description;
                transaction.amount = editTransaction.amount;
                transaction.date = editTransaction.date
            }

            return transaction;
        });
        Transaction.all = newEdit;
        App.reload();
    },

    edit(index){
        const splitdate = Transaction.all[index].date.split("/");
        indexArray = index;
        ModalEdit.open();
        descriptionEdit.value = Transaction.all[index].description;
        amountEdit.value = Transaction.all[index].amount;
        dateEdit.value = `${splitdate[2]}-${splitdate[1]}-${splitdate[0]}`;
    },

    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },

    incomes(){
        // Pegar todas as transações
        let income = 0;
        //Para cada transação, se ela for maior que 0, somar em uma variavel e retornar
        Transaction.all.forEach(transaction => { 
            if(transaction.amount > 0){
                income += transaction.amount;
            }
        });
        return income;
    },

    expense(){
        // Pegar todas as transações
        let expense = 0;
        //Para cada transação, se ela for menor que 0, somar em uma variavel e retornar
        Transaction.all.forEach(transaction => { 
            if(transaction.amount < 0){
                expense += transaction.amount;
            }
        });
        return expense;
    },

    total(){
        return Transaction.incomes() + Transaction.expense();
    }
}

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),

    addTransaction(transaction, index){
        const tr = document.createElement("tr");
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index){
        const CSSclass = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount);
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img class="edit" src="img/edit.svg" alt="Editar Transação" onclick="Transaction.edit(${index})">
            </td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./img/minus.svg" alt="Remover Transação">
            </td>
        `
        return html
    },

    updateBalance(){
        document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(Transaction.incomes());

        document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(Transaction.expense());

        document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : "";
        value = String(value).replace(/\D/g, "");
        value = Number(value) / 100;
        value = value.toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL"
        });
        
        return signal + value;
    },

    formatAmount(value){
        const signal = Number(value) < 0 ? "-": "";
        value = String(value).replace(/\D/g, "");
        value = Number(signal + value);
        return Math.round(value);
    },

    formatDate(date){
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }
}

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues(){
        return{
            description: description.value,
            amount: amount.value,
            date: date.value
        }
    },

    getValuesEdit(){
        return {
            description: descriptionEdit.value,
            amount: amountEdit.value,
            date: dateEdit.value,
        };
    },

    submit(event){
        event.preventDefault();

        try {
            //Verificar se todas as informações foram preenchidas
            Form.validateFields();

            //Formatar os dados para salvar
            const transaction = Form.formatValues();

            //Salvar
            Transaction.add(transaction);

            //Apagar
            Form.clearFields();

            //Fechar Modal
            Modal.close();

        } catch (error) {
            alert(error.message)
        }
    },

    submitEdit(event){
        event.preventDefault();
        const transaction = Form.formatValuesEdit();
        Transaction.addEdit(transaction);
        ModalEdit.close();
    },

    validateFields(){
        const { description, amount, date } = Form.getValues();

        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Por favor, preencha todos os campos");
        }
    },

    formatValues(){
        let { description, amount, date } = Form.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },

    formatValuesEdit(){
        let { description, amount, date } = Form.getValuesEdit();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        return{
            description,
            amount,
            date
        };
    },

    clearFields(){
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    }
}

const App = {
    init(){
        Transaction.all.forEach(DOM.addTransaction);
        
        DOM.updateBalance();

        SaveStorage.set(Transaction.all);
    },
    reload(){
        DOM.clearTransactions();
        App.init();
    },
}

App.init();

document.getElementById("year").innerHTML = new Date().getFullYear();