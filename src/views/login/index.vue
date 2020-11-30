<template>
  <div id="login">
    <div class="login-wrap">
      <ul class="menu_tab">
        <li
          v-for="item in menuTab"
          :class="{ current: item.current }"
          @click="ToggleMenu(item)"
        >
          {{ item.txt }}
        </li>
      </ul>
      <el-form
        :model="ruleForm"
        status-icon
        :rules="rules"
        ref="ruleForm"
        class="login-form"
        size="medium"
      >
        <el-form-item prop="username">
          <label for="username">邮箱</label>
          <el-input
            id="username"
            type="text"
            v-model="ruleForm.username"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <label for="password">密码</label>
          <el-input
            id="password"
            type="password"
            v-model="ruleForm.password"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item prop="passwords" v-if="model == 'register'">
          <label for="passwords">重复密码</label>
          <el-input
            id="passwords"
            type="password"
            v-model="ruleForm.passwords"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item prop="checkcode">
          <label for="checkcode">验证码</label>
          <el-row :gutter="10">
            <el-col :span="15">
              <el-input id="checkcode" v-model="ruleForm.checkcode"></el-input>
            </el-col>
            <el-col :span="9">
              <el-button
                type="success"
                class="block"
                @click="getSms()"
                :disabled="codeButtonStatus.status"
                >{{ codeButtonStatus.text }}</el-button
              >
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button
            type="danger"
            @click="submitForm('ruleForm')"
            class="block"
            v-bind:disabled="loginButtonStatus"
            >{{ model === "login" ? "登录" : "注册" }}</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { stripscript, validateEmail, validatePwd } from "@/utils/validate";
import { reactive, ref, onMounted } from "@vue/composition-api";
import { GetSms, Register } from "@/api/login";
import sha1 from "js-sha1";

export default {
  name: "login",
  //context解构
  setup(props, { refs, root }) {
    const menuTab = reactive([
      { txt: "登录", current: true, type: "login" },
      { txt: "注册", current: false, type: "register" }
    ]);
    const model = ref("login");
    //登录按钮禁用状态
    const loginButtonStatus = ref(true);
    //获取验证码禁用状态
    const codeButtonStatus = reactive({
      status: false,
      text: "获取验证码"
    });
    //倒计时
    const timer = ref(null);
    //表单绑定数据
    const ruleForm = reactive({
      username: "",
      password: "",
      checkcode: "",
      passwords: ""
    });
    let checkcode = (rule, value, callback) => {
      if (!value) {
        callback(new Error("验证码不能为空"));
      } else {
        callback();
      }
    };
    let checkusername = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入邮箱"));
      } else if (!validateEmail(value)) {
        callback(new Error("邮箱格式有误"));
      } else {
        callback();
      }
    };
    let checkpwd = (rule, value, callback) => {
      value = stripscript(value);
      ruleForm.password = stripscript(value);
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (!validatePwd(value)) {
        callback(new Error("请输入6-20位字母数字组合"));
      } else {
        callback();
      }
    };
    let checkpwds = (rule, value, callback) => {
      if (value !== ruleForm.password) {
        callback(new Error("重复密码不正确"));
      } else {
        callback();
      }
    };
    const rules = reactive({
      username: [{ validator: checkusername, trigger: "blur" }],
      password: [{ validator: checkpwd, trigger: "blur" }],
      passwords: [{ validator: checkpwds, trigger: "blur" }],
      checkcode: [{ validator: checkcode, trigger: "blur" }]
    });
    /*
     *声明函数****************************************************************************
     */
    const ToggleMenu = data => {
      menuTab.forEach(elem => {
        elem.current = false;
      });
      data.current = true;
      model.value = data.type;
      refs["ruleForm"].resetFields();
      clearCountDown();
    };

    //表单提交
    const submitForm = formName => {
      //context.refs[formName].validate((valid) => {
      refs[formName].validate(valid => {
        if (valid) {
          model.value === "login" ? login() : register();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    };
    //登录
    const login = () => {
      let requestData = {
        username: ruleForm.username,
        password: sha1(ruleForm.password),
        code: ruleForm.checkcode,
        module: "login"
      };
      root.$store
        .dispatch("app/login", requestData)
        .then(response => {
          root.$message({
            message: "登录成功",
            type: "success"
          });
          root.$router.push({
            name: "Console",
            params: {}
          });
        })
        .catch(error => {});
    };
    //
    const register = () => {
      let requestData = {
        username: ruleForm.username,
        password: sha1(ruleForm.password),
        code: ruleForm.checkcode,
        module: "register"
      };
      Register(requestData)
        .then(response => {
          root.$message({
            message: "注册成功",
            type: "success"
          });
          ToggleMenu(menuTab[0]);
        })
        .catch(error => {});
    };
    //倒计时
    const countDown = number => {
      //setTimeout 执行一次
      //setInterval 一直执行
      // 60 和 0 没显示
      let time = number;
      timer.value = setInterval(() => {
        time--;
        if (time === 0) {
          clearInterval(timer.value);
          codeButtonStatus.status = false;
          codeButtonStatus.text = "再次获取";
          return false;
        }
        codeButtonStatus.text = `倒计时${time}秒`; // ES6 写法 波浪号(1左边的点) ``  ES5写法 单引号‘倒计时’+time+‘秒’
      }, 1000);
    };
    //清除倒计时

    const clearCountDown = () => {
      codeButtonStatus.status = false;
      codeButtonStatus.text = "获取验证码";
      clearInterval(timer.value);
    };
    /*
     * 获取验证码
     */

    const getSms = () => {
      let data = {
        username: ruleForm.username,
        module: model
      };
      if (ruleForm.username == "") {
        root.$message.error("邮箱不能为空");
        return false;
      }
      if (!validateEmail(ruleForm.username)) {
        root.$message.error("邮箱格式有误！！");
        return false;
      }
      codeButtonStatus.status = true;
      codeButtonStatus.text = "发送中";
      setTimeout(() => {
        GetSms(data)
          .then(response => {
            let data = response.data;
            let mes = data.message;
            root.$message({
              message: mes,
              type: "success"
            });
            loginButtonStatus.value = false;
            countDown(5);
          })
          .catch(error => {
            console.log(error);
          });
      }, 2000);
    };
    /*
     *
     */
    onMounted(() => {});
    return {
      menuTab,
      model,
      ToggleMenu,
      ruleForm,
      submitForm,
      rules,
      getSms,
      loginButtonStatus,
      codeButtonStatus
    };
  },
  props: {},
  watch: {}
};
</script>

<style scoped lang="scss">
#login {
  height: 100vh;
  background-color: #2c3e50;
}
.login-wrap {
  width: 330px;
  margin: auto;
}
.menu_tab {
  text-align: center;
  li {
    display: inline-block;
    width: 88px;
    line-height: 36px;
    font-size: 14px;
    color: #fff;
    border-radius: 2px;
    cursor: pointer;
  }
}
.current {
  background-color: rgba(0, 0, 0, 0.1);
}
.login-form {
  margin-top: 29px;
  label {
    display: block;
    margin-bottom: 3px;
    font-size: 14px;
    color: #fff;
  }
}
.block {
  width: 100%;
  display: block;
}
</style>
