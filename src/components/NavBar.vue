<template>
  <div class="navbar-container">
    <b-navbar> 
      <b-navbar-brand>LockerRoom</b-navbar-brand>

      <b-navbar-nav>
        <b-nav-item to="/hints">Hints</b-nav-item>
        <b-nav-item to="/preview">Preview</b-nav-item>
        <b-nav-item to="/images">Images</b-nav-item>
        <b-nav-item to="/model3ds">3D-Models</b-nav-item>
        <b-nav-item  v-if="isSignedIn" @click="signOut" variant="outline-secondary" to="/">Sign Out</b-nav-item>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "NavBar",

  components: {
  },

  data() {
    return {
      username: "",
    }
  }, 

  created: function() {
    let authenticated = this.$cookie.get('locker-room-auth');
    if (authenticated) {
      const username = this.$cookie.get('locker-room-auth');
      this.username = username;
    }
  },

  computed: {
      isSignedIn() {
        return this.$cookie.get('locker-room-auth') !== "";
      } 
  },

  methods: {
    signOut: function() {
      axios.delete('/api/session')
        .then(() => {
          // handle success
          this.$cookie.set('locker-room-auth', '');
          this.username = "";
          setTimeout(() => {
            this.$router.push('/');
          }, 2000);
        }).catch(err => {
          if (err.response.status == 401) {
              this.$cookie.set('locker-room-auth', '');
              this.username = "";
          }
        });
    }
  }
}
</script>

<style scoped>
.navbar-container {
  height: auto;
}

.navbar {
  display: flex;
  border-bottom: 1px solid;
  border-bottom-color: rgb(0, 0, 0);
  justify-content: space-between;
}

.nav-item {
  font-size: 21px;
  margin: 0px 20px 0px 20px;
}

.navbar-brand {
  font-size: 30px;
  font-weight: 600;
  color: #0069D9;
}
</style>