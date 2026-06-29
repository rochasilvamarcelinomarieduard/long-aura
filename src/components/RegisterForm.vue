<template>
  
  <form @submit.prevent="criarConta">
  
    
    <input v-model="nome" placeholder="Nome completo" />

    <input v-model="username" placeholder="Username" />

    <input v-model="email" type="email" placeholder="Email" />

    <input v-model="nascimento" type="date" />

    <select v-model="sexo">
      <option value="">Selecione o sexo</option>
      <option value="masc">Masculino</option>
      <option value="fem">Feminino</option>
      <option value="outro">Outro</option>
    </select>

    <input 
      :type="showPwd ? 'text' : 'password'" 
      v-model="senha" 
      placeholder="Senha" 
    />

    <input 
      :type="showConf ? 'text' : 'password'" 
      v-model="confirmarSenha" 
      placeholder="Confirmar senha" 
    />

    <label>
      <input type="checkbox" v-model="termos" />
      Aceito os termos
    </label>

    <button type="submit">
      Criar conta
    </button>

  </form>
</template>

<script setup>
import { ref } from "vue"

const nome = ref("")
const username = ref("")
const email = ref("")
const nascimento = ref("")
const senha = ref("")
const confirmarSenha = ref("")
const termos = ref(false)
const sexo = ref("")

const showPwd = ref(false)
const showConf = ref(false)

async function criarConta(){
  

  console.log("CLICOU") // DEBUG

  if(senha.value !== confirmarSenha.value){
    alert("As senhas não coincidem")
    return
  }

  if(!termos.value){
    alert("Aceite os termos")
    return
  }

  try {

    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome: nome.value,
        username: username.value,
        email: email.value,
        senha: senha.value,
        nascimento: nascimento.value,
        sexo: sexo.value
      })
    })

    const data = await response.json()

    if(!response.ok){
      alert(data.message)
      return
    }

    alert("Conta criada com sucesso!")

  } catch (error) {

    console.log(error)
    alert("Erro ao conectar com o servidor")

  }

}
</script>

<style scoped>

/* tela */

.screen{
  min-height:100vh;
  width:100%;
  display:flex;
  justify-content:center;
  align-items:center;
  background:#050505;
  padding:30px;
}

/* borda gradiente */

.auth-border{
  padding:3px;
  border-radius:18px;

  background:linear-gradient(
    135deg,
    #ff5fa2,
    #ff8a3d
  );
}

/* card */

.auth-card{
  background:#0e0e0e;
  padding:40px;
  border-radius:16px;
  width:420px;
  max-width:90vw;
}

/* form */

.form{
  display:flex;
  flex-direction:column;
  gap:16px;
}

/* grid */

.row2{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}

/* field */

.field{
  display:flex;
  flex-direction:column;
  gap:6px;
}

label{
  font-size:12px;
  color:#777;
}

/* input */

input{
  padding:14px;
  border-radius:10px;
  border:1px solid #2a2a2a;
  background:#181818;
  color:white;
}

input:focus{
  outline:none;
  border-color:#ff5fa2;
}

/* username prefix */

.input-wrap{
  position:relative;
}

.prefix{
  position:absolute;
  left:10px;
  top:50%;
  transform:translateY(-50%);
  color:#ff5fa2;
}

.has-prefix{
  padding-left:26px;
}

/* eye button */

.eye{
  position:absolute;
  right:10px;
  top:50%;
  transform:translateY(-50%);
  border:none;
  background:none;
  cursor:pointer;
  color:#777;
}

/* checkbox */

.check-label{
  font-size:13px;
  color:#aaa;
  display:flex;
  gap:8px;
  align-items:center;
}

/* botão */

.btn-submit{
  margin-top:10px;
  padding:15px;
  border:none;
  border-radius:12px;

  background:linear-gradient(
    135deg,
    #ff5fa2,
    #ff8a3d
  );

  color:white;
  font-weight:600;
  cursor:pointer;
}

.btn-submit:hover{
  opacity:0.9;
}

/* responsivo */

@media (max-width:480px){

.row2{
grid-template-columns:1fr;
}

}

</style>

