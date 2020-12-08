<template>
  <div class="page">
    <div class="title">
      <h1>Locker Room</h1>
    </div>

    <div>
      <p>Please sign in or sign up a new account to continue</p>
    </div>
    
    <div class="form">
      <b-form>
        <b-form-input
          class="form-input"
          required
          placeholder="Username"
          v-model="username"
        ></b-form-input>
        <b-form-input
          class="form-input"
          required
          placeholder="Password"
          v-model="password"
        ></b-form-input>

        <div class="form-buttons">
          <b-button @click="signIn" variant="primary">Sign In</b-button>
          <b-button @click="signUp" variant="primary">Sign Up</b-button>
        </div>
      </b-form>

    <b-alert
      v-model="showError"
      class="position-fixed fixed-bottom m-0 rounded-0"
      style="z-index: 2000;"
      variant="warning"
      dismissible
    >
      {{ error }}
    </b-alert>

    <b-alert
      v-model="showMessage"
      class="position-fixed fixed-bottom m-0 rounded-0"
      style="z-index: 2000;"
      variant="success"
      dismissible
    >
      {{ message }}
      <b-spinner variant="success"></b-spinner>
    </b-alert>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Account",
  
  data() {
    return {
      username: "",
      password: "",
      error: "",
      showError: false,
      showMessage: false,
      message: "",
    }
  },

  methods: {
    signIn: function(evt) {
      evt.preventDefault();
      const bodyContent = { username: this.username, password: this.password };
      axios
        .post('/api/session', bodyContent)
        .then((res) => {
          // handle success
          this.$cookie.set('locker-room-auth', res.data.data.name);
          this.message = res.data.message;
          this.showMessage = true;
          this.clearMessages();
          setTimeout(() => {
            this.$router.push('/hints');
          }, 2000);
        })
        .catch(err => {
          // handle error
          this.error = err.response.data.error;
          this.showError = true;
          this.clearErrors();
        })
      },

    signUp: function(evt) {
      evt.preventDefault();
      const bodyContent = { username: this.username, password: this.password };
      axios
        .post('/api/users', bodyContent)
        .then(() => {
          // handle success
          axios
            .post('/api/session', bodyContent)
            .then((res) => {
              // handle success
              this.$cookie.set('locker-room-auth', res.data.data.name);
              this.message = "Signed up successfully, logging you in!";
              this.showMessage = true;
              this.clearMessages();
              setTimeout(() => {
                this.$router.push('/hints');
              }, 2000);
            })
            .catch(err => {
              // handle error
              this.error = err.response.data.error;
              this.showError = true;
              this.clearErrors();
            })
        })
        .catch(err => {
          // handle error
          this.error = err.response.data.error;
          this.showError = true;
          this.clearErrors();
        });
    },

    clearErrors: function() {
      this.username = "";
      this.password = "";
      setTimeout(() => {
        this.showError = false;
        this.error = "";
      }, 5000);
    },

    clearMessages: function() {
      this.username = "";
      this.password = "";
      setTimeout(() => {
        this.showMessage = false;
        this.message = "";
      }, 5000);
    }
  }
}

</script>

<style scoped>
h1 {
  display: flex;
  color: "primary";
  font-weight: 700;
  font-size: 120px;
  margin: 100px;
}
.page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.form-input {
  min-width: 300px;
  margin-top: 20px;
}

.form-buttons {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

button {
  margin: 10px;
}

</style>