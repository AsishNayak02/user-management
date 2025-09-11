"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFormik } from "formik"
import { UserRoundPlus } from "lucide-react"
import { useState } from "react"

const initialUserDetails = {
    organization: "",
    group: "",
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
}

export function AddUserForm() {
    const [step, setStep] = useState(1);
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: initialUserDetails,
        // validate: (values) => {
        //     const schema = patientInfoValidationSchema(isVCF);
        //     const result = schema.safeParse(values);
        //     if (!result.success) {
        //         return result.error.formErrors.fieldErrors;
        //     }
        //     return {};
        // },
        onSubmit: (values: any, action: any) => {
            // handleFormSubmit(values);
            if (step < 3) {
                // ✅ Go to next step if valid
                setStep(step + 1)
            } else {
                // ✅ Final submit
                console.log("Final user:", values)
                // handleFormSubmit(values)
            }
        },
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button><UserRoundPlus />Add User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] h-[65vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add User</DialogTitle>
                    <DialogDescription>
                        Step {step} of 3
                    </DialogDescription>
                </DialogHeader>
                <form
                    id="user-form"
                    onSubmit={formik.handleSubmit}
                    className="flex-1 flex flex-col overflow-hidden"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    }}>
                        <div className="flex-1 overflow-y-auto">
                    {step === 1 && (
                        <div className="flex flex-col gap-y-4 mb-4">
                            <div className="gap-y-1 flex flex-col">
                                <Label>Organization</Label>
                                <Select
                                    onValueChange={(val) => formik.setFieldValue("organization", val)}
                                    value={formik.values.organization}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select organization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="org1">Org 1</SelectItem>
                                        <SelectItem value="org2">Org 2</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formik.errors.organization && (
                                    <p className="text-red-500 text-sm">{formik.errors.organization}</p>
                                )}
                            </div>
                            <div className="gap-y-1 flex flex-col">
                                <Label>Group</Label>
                                <Select
                                    onValueChange={(val) => formik.setFieldValue("group", val)}
                                    value={formik.values.group}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="group1">Group 1</SelectItem>
                                        <SelectItem value="group2">Group 2</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formik.errors.group && (
                                    <p className="text-red-500 text-sm">{formik.errors.group}</p>
                                )}
                            </div>
                        </div>
                    )}
                    {/* STEP 2: Username, FirstName, Lname */}
                    {step === 2 && (
                        <div className="grid gap-4 mb-4">
                            <div className="flex flex-col gap-y-1">
                                <Label>Username</Label>
                                <Input
                                    name="username"
                                    value={formik.values.username}
                                    onChange={formik.handleChange}
                                />
                                {formik.errors.username && (
                                    <p className="text-red-500 text-sm">{formik.errors.username}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>First Name</Label>
                                <Input
                                    name="firstName"
                                    value={formik.values.firstName}
                                    onChange={formik.handleChange}
                                />
                                {formik.errors.firstName && (
                                    <p className="text-red-500 text-sm">{formik.errors.firstName}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Last Name</Label>
                                <Input
                                    name="lastName"
                                    value={formik.values.lastName}
                                    onChange={formik.handleChange}
                                />
                                {formik.errors.lastName && (
                                    <p className="text-red-500 text-sm">{formik.errors.lastName}</p>
                                )}
                            </div>
                        </div>
                    )}
                    {/* STEP 3: Email, Password, Confirm Password */}
                    {step === 3 && (
                        <div className="grid gap-4 mb-4">
                            <div className="flex flex-col gap-y-1">
                                <Label>Email</Label>
                                <Input
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                />
                                {formik.errors.email && (
                                    <p className="text-red-500 text-sm">{formik.errors.email}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    name="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                />
                                {formik.errors.password && (
                                    <p className="text-red-500 text-sm">{formik.errors.password}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-y-1">
                                <Label>Confirm Password</Label>
                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                />
                                {formik.errors.confirmPassword && (
                                    <p className="text-red-500 text-sm">{formik.errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>
                    )}
                    </div>
                    <DialogFooter className="mt-auto pt-4">
                        {step > 1 && (
                            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                                Back
                            </Button>
                        )}
                        {step < 3 ? (
                            <Button type="submit">Next</Button>
                        ) : (
                            <>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button type="submit">Save User</Button>
                            </>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
