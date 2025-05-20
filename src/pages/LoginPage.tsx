/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

import axios from "axios";
import FormikForm from "../Components/Form/FormikForm";
import InputField from "../Components/FormFields/InputField";
import Button from "../Components/Button/Button";

interface LoginValues {
  email: string;
  password: string;
}

const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const Login: React.FC = ({ onLogin }) => {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:3000";

  const handleLoginSubmit = async (values: LoginValues) => {
    try {
      onLogin();
      navigate("/attendance");
    } catch (error: any) {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message
      );
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

      <FormikForm
        initialValues={{ email: "", password: "" }}
        validationSchema={loginValidationSchema}
        onSubmit={handleLoginSubmit}
      >
        {(formikProps) => (
          <div>
            <InputField
              name="email"
              type="email"
              placeholder="Email"
              error={
                formikProps.errors.email &&
                typeof formikProps.errors.email === "string"
                  ? formikProps.errors.email
                  : undefined
              }
              touched={
                formikProps.touched.email &&
                typeof formikProps.touched.email === "boolean"
                  ? formikProps.touched.email
                  : undefined
              }
            />
            <InputField
              name="password"
              type="password"
              placeholder="Password"
              error={
                formikProps.errors.password &&
                typeof formikProps.errors.password === "string"
                  ? formikProps.errors.password
                  : undefined
              }
              touched={
                formikProps.touched.password &&
                typeof formikProps.touched.password === "boolean"
                  ? formikProps.touched.password
                  : undefined
              }
            />
            <div className="flex flex-col items-center mt-4">
              <Button type="submit" variant="primary" className="w-full">
                Login
              </Button>
            </div>
          </div>
        )}
      </FormikForm>
    </div>
  );
};

export default Login;
