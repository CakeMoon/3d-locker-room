<template>
  <div>
    <NavBar/>
    <div class="content">
    <div class="upload">
      <b-form class="form">
        <b-form-file
          v-model="fileImage"
          placeholder="Choose a file or drop it here..."
          drop-placeholder="Drop file here..."
          accept="image/*"
        ></b-form-file>
        
        <div class="form-down">
        <b-form-input
          class="form-input"
          required
          placeholder="Name"
          v-model="name"
        ></b-form-input>
        <b-form-input
          class="form-input"
          required
          placeholder="Width"
          v-model="width"
        ></b-form-input>
        <b-form-input
          class="form-input"
          required
          placeholder="Height"
          v-model="height"
        ></b-form-input>

        <b-button @click="convert" variant="primary">Upload</b-button>
        </div>
      </b-form>
    </div>

    <div class="images-container">
      <ImageCard
        v-for="image in images"
        :key="image.id"
        :image="image"
      ></ImageCard>
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
import ImageCard from '../components/ImageCard';
import axios from "axios";
import { eventBus } from "../main";

export default {
  name: "ImagePage",

  components: {
    NavBar,
    ImageCard
  },

  data() {
    return {
      error: "",
      showError: false,
      showMessage: false,
      message: "",
      fileImage: null,
      url: "",
      name: "",
      width: "",
      height: "",
      images: [],
    }
  },

  created: function() {
    this.listAllImages();

    eventBus.$on("delete-image-success", (res) => {
      this.listAllImages();
      this.message = res.data.message;
      this.showMessage = true;
      this.clearMessages();
    });
       
    eventBus.$on("delete-image-error", (err) => {
      this.error = err.response.data.error;
      this.showError = true;
      this.clearErrors();
    });

  },

  methods: {
    convert: function(evt) {
      evt.preventDefault();
      const reader = new FileReader();
      reader.readAsDataURL(this.fileImage);
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
      formData.append('width', parseInt(this.width));
      formData.append('height',  parseInt(this.height));
      axios
        .post('/api/images', 
          formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then((res) => {
          // handle success
          this.listAllImages();
          this.message = res.data.message;
          this.showMessage = true;
          this.clearMessages();
          eventBus.$emit('upload-image-success');
        })
        .catch(err => {
          // handle error
          this.error = err.response.data.error;
          this.showError = true;
          this.clearErrors();
        })
    },

    listAllImages() {
      this.error = "";
      axios.get('/api/images')
        .then(res => {
            this.images = res.data;
        })
        .catch(e => console.log(e));
    },

    clearErrors: function() {
      this.width = "";
      this.height = "";
      this.fileImage = null;
      this.url = "";
      this.name = "";
      setTimeout(() => {
        this.showError = false;
        this.error = "";
      }, 5000);
    },

    clearMessages: function() {
      this.width = "";
      this.height = "";
      this.fileImage = null;
      this.url = "";
      this.name = "";
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
  width: 180px;
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