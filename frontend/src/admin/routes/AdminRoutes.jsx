import { Route, Routes } from "react-router";import AdminDashboard from "../pages/AdminDashboard";
import AdminCourses from "../pages/AdminCourses";
import AdminCourseForm from "../pages/AdminCourseForm";
import AdminStudents from "../pages/AdminStudents";
import Enquiries from "../pages/Enquiries";
import Quizzes from "../pages/Quizzes";
import QuizForm from "../pages/QuizForm";
import Questions from "../pages/Questions";
import Schools from "../pages/Schools";
import SchoolForm from "../pages/SchoolForm";
import Categories from "../pages/Categories";
import Users from "../pages/Users";
import Teams from "../pages/Teams";

function AdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<Users />} />
      <Route path="teams" element={<Teams />} />
      <Route path="students" element={<AdminStudents />} />
      <Route path="enquiries" element={<Enquiries />} />

      <Route path="courses" element={<AdminCourses />} />
      <Route path="courses/new" element={<AdminCourseForm />} />
      <Route path="courses/:id/edit" element={<AdminCourseForm />} />

      <Route path="schools" element={<Schools />} />
      <Route path="schools/new" element={<SchoolForm />} />
      <Route path="schools/:id/edit" element={<SchoolForm />} />

      <Route path="questions" element={<Questions />} />

      <Route path="quizzes" element={<Quizzes />} />
      <Route path="quizzes/new" element={<QuizForm />} />
      <Route path="quizzes/:id/edit" element={<QuizForm />} />

      <Route path="categories" element={<Categories />} />
    </Routes>
  );
}

export default AdminRoutes;