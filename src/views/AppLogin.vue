<template>
  <div class="login-container">
    <div class="login-box">
      <h2>用户登录</h2>
      <el-form @submit.prevent="login" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="emp_id" placeholder="请输入用户" />
        </el-form-item>

        <el-form-item label="密码">
          <el-input v-model="password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
<el-form-item label="验证码">
    <el-input v-model="captcha" placeholder="请输入验证码" />
    <img :src="captchaImage" alt="验证码" @click="getCaptcha" style="margin-top: 10px; cursor: pointer;">
  </el-form-item>
        <el-button native-type="submit" type="primary" style="width: 100%">登录</el-button>
      </el-form>
    </div>
     <img
      :src="dynamicImage" 
      alt="动态图片" 
      class="dynamic-image">
  </div>
</template>

<script>
import dynamicImage from '@/assets/0b32a0b601da4f8bada9422817f2e521.gif';
import { ElMessage } from 'element-plus';
import axios from 'axios'; // 引入 axios
import CryptoJS from 'crypto-js'; // 引入 crypto-js
import { generateSignatureWithTimestamp } from '@/utils/signature';
export default {
  data() {
    return {

      emp_id: '',
      password: '',
      captcha: '',
    captchaImage: '',
      captchaId: '',
      dynamicImage: dynamicImage
    };
  },
  mounted() {
    this.getCaptcha();
  }, 
  methods: {
   async getCaptcha() {
      try {
        const response = await axios.get('http://localhost:8082/captcha');
        this.captchaId = response.data.captchaId;
        this.captchaImage = response.data.image || `data:image/svg+xml;utf8,${response.data.svg}`;
      } catch (error) {
        console.error('获取验证码失败:', error);
        ElMessage.warning('获取验证码失败，请稍后再试');
      }
    },
    async login() { // 改为异步方法
      const payload = {
    emp_id: this.emp_id,
    password: CryptoJS.SHA256(this.password).toString()
  };
  const { signature, timestamp } = generateSignatureWithTimestamp(payload);

      try {
const response = await axios.post('http://localhost:8082/login', payload, {
  headers: {
    'X-Captcha-Key': this.captchaId,
    'X-Captcha': this.captcha,
     'X-Signature': signature,
     'X-Timestamp': timestamp
  
  }
        }
  
 );

        if (response.data.code === 1) {
         localStorage.setItem('emp_id', response.data.data.emp_id);
            sessionStorage.setItem('token', response.data.data.token);
         console.log(localStorage.getItem('emp_id'));
  ElMessage.success('登录成功');
  this.$router.push('/home');
        } else {
          ElMessage.error('登录失败: ' + response.data.msg);
           this.getCaptcha();
        }
      } catch (error) {
        console.error('请求失败:', error);
        ElMessage.warning('网络错误，请稍后再试');
      }
    },
    

}};
</script>

<style scoped>
/* 统一输入框容器宽度为 100% */
::v-deep .el-form-item__content {
  width: 100%;
}

/* 确保 el-input 宽度占满父容器 */
::v-deep .el-input {
  width: 100%;
}

/* 统一输入框高度、圆角、字体等 */
::v-deep .el-input__inner {
  width: 100%;
  height: 45px;
  font-size: 1rem;
  padding: 10px 15px;
  border-radius: 6px;
  border-color: #ccc;
}

/* 聚焦状态：统一蓝色边框和阴影效果 */
::v-deep .el-input__inner:focus {
  border-color: #409EFF !important; /* 强制使用 Element Plus 主色 */
}

::v-deep .el-input__inner {
  height: 45px;
  font-size: 1rem;
  padding: 10px 15px;
  border-radius: 6px;
  border-color: #ccc;
}

::v-deep .el-form-item__content {
  width: 100%;
}
.login-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom right, #e0e0e0, #bcbcbc),
              url('https://images.unsplash.com/photo-1500382017468-9049edb78540') no-repeat center center fixed;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-box {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.login-box h2 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}
</style>