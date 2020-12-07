<template>
  <div>
    <NavBar/>
    <div class="content">
    <div class="upload">
      <b-form class="form">
        <b-form-file
          v-model="fileModel"
          placeholder="Choose a file or drop it here..."
          drop-placeholder="Drop file here..."
        ></b-form-file>
        
        <div class="form-down">
        <b-form-input
          class="form-input"
          required
          placeholder="Name"
          v-model="name"
        ></b-form-input>

        <b-button @click="convert" variant="primary">Upload</b-button>
        </div>
      </b-form>
    </div>

    <div class="images-container">
      <ModelCard
        v-for="model3D in model3Ds"
        :key="model3D.id"
        :model3D="model3D"
      ></ModelCard>
    </div>
    </div>

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
</template>

<script>
import NavBar from '../components/NavBar';
import ModelCard from '../components/ModelCard';
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: "ModelPage",

  components: {
    NavBar,
    ModelCard
  },

  data() {
    return {
      error: "",
      showError: false,
      showMessage: false,
      message: "",
      fileModel: null,
      url: "",
      name: "",
      model3Ds: [],
    }
  },

  created: function() {
    this.listAllModels();

    eventBus.$on("delete-model-success", (res) => {
      this.listAllModels();
      this.message = res.data.message;
      this.showMessage = true;
      this.clearMessages();
    });
       
    eventBus.$on("delete-model-error", (err) => {
      this.error = err.response.data.error;
      this.showError = true;
      this.clearErrors();
    });

  },

  methods: {
    convert: function(evt) {
      evt.preventDefault();
      const reader = new FileReader();
      reader.readAsDataURL(this.fileModel);
      reader.onload = () => {
        this.url = reader.result;
        this.upload();
      }
      reader.onerror = (err) => {
        this.error = err.response.data.error;
        this.showError = true;
        this.clearErrors();
      }
    },

    upload: function() {
      let formData = new FormData();
      formData.append('file', this.url);
      formData.append('name', this.name);
      axios
        .post('/api/model3ds',
          formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then((res) => {
          // handle success
          this.listAllModels();
          this.message = res.data.message;
          this.showMessage = true;
          this.clearMessages();
          eventBus.$emit('upload-model-success');
        })
        .catch(err => {
          // handle error
          this.error = err.response.data.error;
          this.showError = true;
          this.clearErrors();
        })
    },

    submitFile() {
      let formData = new FormData();
      formData.append('file', this.url);
      formData.append('name', this.name);

      // You should have a server side REST API 
      axios.post('/api/model3ds',
          formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        ).then(function () {
          console.log('SUCCESS!!');
        })
        .catch(function () {
          console.log('FAILURE!!');
        });
    },

    listAllModels() {
      this.error = "";
      axios.get('/api/model3ds')
        .then(res => {
            this.model3Ds = res.data;
        })
        .catch(e => console.log(e));
    },

    clearErrors: function() {
      this.fileModel = null,
      this.url = "",
      this.name = "",
      setTimeout(() => {
        this.showError = false;
        this.error = "";
      }, 5000);
    },

    clearMessages: function() {
      this.fileModel = null,
      this.url = "",
      this.name = "",
      setTimeout(() => {
        this.showMessage = false;
        this.message = "";
      }, 1000);
    }
  }
}
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.upload {
  margin: 10px;
}

.form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 640px;
}

.form-textarea {
  width: 100%;
}

.form-down {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.form-input {
  width: 540px;
  margin-top: 10px;
}

button {
  margin-top: 10px;
}

.images-container {
  width: 1000px;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  padding: 1rem 1rem 2rem 1rem;
  /* height: 72vh; */
  /* overflow-y:scroll; */
}
</style>