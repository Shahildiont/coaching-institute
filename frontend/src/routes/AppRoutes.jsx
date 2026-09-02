import { Routes, Route } from "react-router";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedAdminRoute from "./ProtectedAdminRoute";

import Home from "../pages/Home";
import Courses from "../pages/Courses";
import Quiz from "../pages/Quiz";
import TakeTest from "../pages/TakeTest";
import QuizResult from "../pages/QuizResult";
import About from "../pages/About";
import Enquire from "../pages/Enquire";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import CoursePayment from "../pages/CoursePayment";

import OfflineScreen from "../components/OfflineScreen";
import useOnlineStatus from "../hooks/useOnlineStatus";

import AdminLayout from "../admin/layout/AdminLayout";
import Dashboard from "../admin/pages/AdminDashboard";
import Users from "../admin/pages/Users";
import Teams from "../admin/pages/Teams";
import Students from "../admin/pages/AdminStudents";
import AdminCourses from "../admin/pages/AdminCourses";
import AdminCourseForm from "../admin/pages/AdminCourseForm";
import Quizzes from "../admin/pages/Quizzes";
import QuizForm from "../admin/pages/QuizForm";
import Coupons from "../admin/pages/Coupons";
import CouponForm from "../admin/pages/CouponForm";
import Questions from "../admin/pages/Questions";
import Enquiries from "../admin/pages/Enquiries";
import Schools from "../admin/pages/Schools";
import SchoolForm from "../admin/pages/SchoolForm";
import SchoolDetails from "../admin/pages/SchoolDetails";
import Categories from "../admin/pages/Categories";
import QuestionPapers from "../admin/pages/QuestionPapers";

function AppRoutes() {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return <OfflineScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id/payment" element={<CoursePayment />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="quiz/:id" element={<TakeTest />} />
        <Route path="quiz/result/:id" element={<QuizResult />} />
        <Route path="about" element={<About />} />
        <Route path="enquire" element={<Enquire />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="users" element={<Users />} />
          <Route path="teams" element={<Teams />} />
          <Route path="students" element={<Students />} />

          <Route path="courses" element={<AdminCourses />} />
          <Route path="courses/new" element={<AdminCourseForm />} />
          <Route path="courses/:id/edit" element={<AdminCourseForm />} />

          <Route path="schools" element={<Schools />} />
          <Route path="schools/new" element={<SchoolForm />} />
          <Route path="schools/:id" element={<SchoolDetails />} />
          <Route path="schools/:id/edit" element={<SchoolForm />} />

          <Route path="categories" element={<Categories />} />

          <Route path="questions" element={<Questions />} />
          <Route path="question-papers" element={<QuestionPapers />} />

          <Route path="quizzes" element={<Quizzes />} />
          <Route path="quizzes/new" element={<QuizForm />} />
          <Route path="quizzes/:id/edit" element={<QuizForm />} />

          <Route path="coupons" element={<Coupons />} />
          <Route path="coupons/new" element={<CouponForm />} />
          <Route path="coupons/:id/edit" element={<CouponForm />} />

          <Route path="enquiries" element={<Enquiries />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;