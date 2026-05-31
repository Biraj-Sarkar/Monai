import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Layout from "./layouts/Layout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Insights from "./pages/Insights.jsx";
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Contacts from "./pages/Contacts.jsx";
import { silentRefresh } from "./utils/apiClient.js";
import { setGlobalDispatch } from "./utils/apiClient.js";
import Help from "./support/Help.jsx";
import Terms from "./support/Terms.jsx";
import Privacy from "./support/Privacy.jsx";
import Settings from "./support/Settings.jsx"

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path='/' element={<Layout />}>
			<Route path='/' element={<Home />} />
			<Route path='/login' element={<Login />} />
			<Route path='/register' element={<Register />} />
			<Route path='/dashboard' element={<Dashboard />} />
			<Route path='/insights' element={<Insights />} />
			<Route path='/contact' element={<Contacts />} />
			<Route path='/help' element={<Help />} />
			<Route path='/terms' element={<Terms />} />
			<Route path='/privacy' element={<Privacy />} />
			<Route path='/settings' element={<Settings />} />
		</Route>
	)
)

function App() {
	const [loading, setLoading] = useState(true);
	const dispatch = useDispatch();

	useEffect(() => {
		const initializeAuth = async () => {
			setGlobalDispatch(dispatch);
			await silentRefresh(dispatch);
			setLoading(false);
		};

		initializeAuth();
	}, [dispatch]);

	if (loading) {
		return (
			<div className="app-page-bg min-h-screen flex items-center justify-center px-4">
				<div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-center shadow-lg backdrop-blur-md">
					<div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-500 border-t-cyan-400" />
					<h2 className="mt-4 text-lg font-semibold text-white">Preparing your workspace</h2>
					<p className="mt-1 text-sm text-slate-300">Loading your session securely...</p>
				</div>
			</div>
		);
	}
		return (
			<ErrorBoundary>
				<RouterProvider router={router} />
			</ErrorBoundary>
		);
}

export default App
