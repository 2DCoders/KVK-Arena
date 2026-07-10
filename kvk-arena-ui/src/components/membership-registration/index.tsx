import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";

type MembershipRegistrationProps = {
	open: boolean;
	onClose: () => void;
};

export default function MembershipRegistration({
	open,
	onClose,
}: MembershipRegistrationProps) {
	const [gender, setGender] = useState("male");

	useEffect(() => {
		if (!open) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [onClose, open]);

	if (!open || typeof document === "undefined") return null;

	return createPortal(
		<div className="fixed inset-0 z-[50000] bg-slate-950/80 backdrop-blur-sm">
			<div
				className="absolute inset-0"
				aria-hidden="true"
				onClick={onClose}
			/>

			<div className="relative z-10 h-full w-full overflow-y-auto">
				<div className="flex h-screen w-screen items-stretch">
					<div className="relative flex h-full w-full flex-col overflow-hidden bg-[#f7f9fd]">
						<div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl">
							<div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-7 sm:py-5">
								<div className="max-w-3xl">
									<div className="inline-flex items-center gap-2 rounded-full border border-[#296BE1]/15 bg-[#296BE1]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#296BE1]">
										{/* <Info size={14} /> */}
										Full Arena Membership
									</div>
								</div>

								<button
									type="button"
									onClick={onClose}
									aria-label="Close membership registration modal"
									className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
								>
									<X size={20} />
								</button>
							</div>
						</div>

						<div className="grid flex-1 overflow-auto lg:grid-cols-[0.9fr_1.1fr]">
							<aside className="border-b overflow-y-auto border-slate-200 bg-[#081a3d] px-5 py-6 text-white sm:px-7 sm:py-8 lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
								<div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:pr-1">
									<p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
										Why register
									</p>

									<h3 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
										Join the arena with one simple application.
									</h3>

									<p className="mt-4 max-w-xl text-sm leading-7 text-white/80 sm:text-[15px]">
										The membership is designed for people who want convenience,
										priority handling, and a better experience across KVK Arena
										services.
									</p>

									<div className="mt-6 rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_20px_55px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-6">
										<div className="flex items-start gap-3">
											<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#296BE1] text-white shadow-[0_14px_30px_rgba(41,107,225,0.32)]">
												<Info size={18} />
											</div>

											<div>
												<p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8FC0FF]">
													Registration note
												</p>
												<p className="mt-2 text-sm leading-7 text-white/78">
													Use a reachable WhatsApp number and email address so
													our team can contact you quickly after you apply.
												</p>
											</div>
										</div>
									</div>

									<div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
										{[
											["01", "Enter your details"],
											["02", "Submit the application"],
											["03", "Wait for follow-up"],
										].map(([step, label]) => (
											<div
												key={label}
												className="rounded-2xl border border-white/10 bg-white/6 px-4 py-4"
											>
												<div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8FC0FF]">
													Step {step}
												</div>
												<div className="mt-2 text-sm font-medium text-white/90">
													{label}
												</div>
											</div>
										))}
									</div>
								</div>
							</aside>

							<main className="bg-white px-5 py-6 sm:px-7 sm:py-8 lg:px-8 lg:py-10 overflow-y-auto">
								<form className="grid gap-5">
									<div className="grid gap-5 sm:grid-cols-2">
										<Field label="First name" name="firstName" placeholder="Enter first name" required />
										<Field label="Last name" name="lastName" placeholder="Enter last name" required />
									</div>

									<div className="grid gap-5 sm:grid-cols-2">
										<Field label="Date of birth" name="dateOfBirth" type="date" required />
										<Field label="WhatsApp no" name="whatsapp" placeholder="07xxxxxxxx" required />
									</div>

									<div className="grid gap-5 sm:grid-cols-2">
										<Field label="Email" name="email" type="email" placeholder="you@example.com" required />
										<Field label="NIC (optional)" name="nic" placeholder="Enter NIC number" />
									</div>

									<div className="grid gap-5">
										<div>
											<label className="mb-2 block text-sm font-semibold text-slate-800">
												Gender
											</label>
											<div className="grid gap-3 sm:grid-cols-3">
												{[
													["male", "Male"],
													["female", "Female"],
													["other", "Other"],
												].map(([value, label]) => (
													<label
														key={value}
														className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
															gender === value
																? "border-[#296BE1] bg-[#296BE1]/6 text-slate-950"
																: "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
														}`}
													>
														<input
															type="radio"
															name="gender"
															value={value}
															checked={gender === value}
															onChange={() => setGender(value)}
															className="h-4 w-4 accent-[#296BE1]"
														/>
														<span className="text-sm font-medium">{label}</span>
													</label>
												))}
											</div>
										</div>
									</div>

									<div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
										<p className="text-sm leading-7 text-slate-500">
											By applying, you agree that KVK Arena may contact you for
											membership verification and next steps.
										</p>

										<button
											type="submit"
											className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#296BE1] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(41,107,225,0.3)] transition hover:-translate-y-0.5 hover:bg-[#2158bc]"
										>
											Apply Now
										</button>
									</div>
								</form>
							</main>
						</div>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
}

type FieldProps = {
	label: string;
	name: string;
	type?: string;
	placeholder?: string;
	required?: boolean;
};

function Field({
	label,
	name,
	type = "text",
	placeholder,
	required,
}: FieldProps) {
	return (
		<label className="block">
			<span className="mb-2 block text-sm font-semibold text-slate-800">
				{label}
			</span>
			<input
				name={name}
				type={type}
				placeholder={placeholder}
				required={required}
				className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#296BE1] focus:ring-4 focus:ring-[#296BE1]/10"
			/>
		</label>
	);
}