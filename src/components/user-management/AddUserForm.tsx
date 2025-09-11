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
import { useState, useEffect } from "react"
import axios from "@/api/index"
import { checkUserExists } from "@/api/userListing"
import { validateField, isReadyForValidation, validateAllFields } from "@/lib/validation"
import { useOrganizationsAndGroups } from "@/hooks/useOrganizationsAndGroups"

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

// Removed interfaces - now using simple strings

export function AddUserForm() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    // Use global cache for organizations and groups
    const { organizations, groups, loading } = useOrganizationsAndGroups();
    const [validationErrors, setValidationErrors] = useState<{
        username?: string;
        email?: string;
    }>({});
    const [formatErrors, setFormatErrors] = useState<{
        username?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        firstName?: string;
        lastName?: string;
        organization?: string;
        group?: string;
    }>({});
    const [isValidating, setIsValidating] = useState(false);
    
    // Organizations and groups are now managed by the global cache hook

    // Real-time validation function
    const validateUserExists = async (field: 'username' | 'email', value: string) => {
        if (!value.trim()) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
            setFormatErrors(prev => ({ ...prev, [field]: undefined }));
            return;
        }

        // First check format validation
        const formatValidation = validateField(field, value, formik.values);
        if (!formatValidation.isValid) {
            setFormatErrors(prev => ({ ...prev, [field]: formatValidation.error }));
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
            return;
        } else {
            setFormatErrors(prev => ({ ...prev, [field]: undefined }));
        }

        // Only check existence if format is valid and value is ready for validation
        if (!isReadyForValidation(field, value)) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
            return;
        }

        setIsValidating(true);
        try {
            const response = await checkUserExists(
                field === 'username' ? value : undefined,
                field === 'email' ? value : undefined
            );
            
            if (response.data.exists) {
                setValidationErrors(prev => ({
                    ...prev,
                    [field]: `${field === 'username' ? 'Username' : 'Email'} already exists. Please choose a different one.`
                }));
            } else {
                setValidationErrors(prev => ({ ...prev, [field]: undefined }));
            }
        } catch (error) {
            console.error(`Error validating ${field}:`, error);
        } finally {
            setIsValidating(false);
        }
    };

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
        onSubmit: async (values: any, action: any) => {
            if (step < 3) {
                // ✅ Go to next step if valid
                setStep(step + 1)
            } else {
                // ✅ Final submit
                // Check for validation errors before submitting
                const allValidation = validateAllFields(values);
                if (!allValidation.isValid || validationErrors.username || validationErrors.email) {
                    // Set all format errors from validation
                    setFormatErrors(allValidation.errors);
                    return;
                }

                setIsSubmitting(true);
                try {
                    const response = await axios.post("/api/admin/create-user", {
                        username: values.username,
                        email: values.email,
                        password: values.password,
                        organization: values.organization, // Now it's already the name
                        group: values.group, // Now it's already the name
                        firstName: values.firstName,
                        lastName: values.lastName
                    });
                    
                    // Reset form and close dialog
                    formik.resetForm();
                    setStep(1);
                    setIsOpen(false);
                    setValidationErrors({});
                    setFormatErrors({});
                    // You might want to refresh the user list here
                    // window.location.reload(); // Simple refresh for now
                } catch (error: any) {
                    const errorMessage = error.response?.data?.error || error.message || "Failed to create user. Please try again.";
                    alert(errorMessage);
                } finally {
                    setIsSubmitting(false);
                }
            }
        },
    });

    // Debounced validation for username
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formik.values.username) {
                validateUserExists('username', formik.values.username);
            }
        }, 500); // 500ms delay

        return () => clearTimeout(timeoutId);
    }, [formik.values.username]);

    // Debounced validation for email
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formik.values.email) {
                validateUserExists('email', formik.values.email);
            }
        }, 500); // 500ms delay

        return () => clearTimeout(timeoutId);
    }, [formik.values.email]);

    // Real-time validation for password
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formik.values.password) {
                const validation = validateField('password', formik.values.password, formik.values);
                if (!validation.isValid) {
                    setFormatErrors(prev => ({ ...prev, password: validation.error }));
                } else {
                    setFormatErrors(prev => ({ ...prev, password: undefined }));
                }
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [formik.values.password]);

    // Real-time validation for confirmPassword
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formik.values.confirmPassword) {
                const validation = validateField('confirmPassword', formik.values.confirmPassword, formik.values);
                if (!validation.isValid) {
                    setFormatErrors(prev => ({ ...prev, confirmPassword: validation.error }));
                } else {
                    setFormatErrors(prev => ({ ...prev, confirmPassword: undefined }));
                }
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [formik.values.confirmPassword, formik.values.password]);

    // Real-time validation for firstName
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formik.values.firstName) {
                const validation = validateField('firstName', formik.values.firstName, formik.values);
                if (!validation.isValid) {
                    setFormatErrors(prev => ({ ...prev, firstName: validation.error }));
                } else {
                    setFormatErrors(prev => ({ ...prev, firstName: undefined }));
                }
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [formik.values.firstName]);

    // Real-time validation for lastName
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formik.values.lastName) {
                const validation = validateField('lastName', formik.values.lastName, formik.values);
                if (!validation.isValid) {
                    setFormatErrors(prev => ({ ...prev, lastName: validation.error }));
                } else {
                    setFormatErrors(prev => ({ ...prev, lastName: undefined }));
                }
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [formik.values.lastName]);

    // Real-time validation for organization
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formik.values.organization) {
                const validation = validateField('organization', formik.values.organization, formik.values);
                if (!validation.isValid) {
                    setFormatErrors(prev => ({ ...prev, organization: validation.error }));
                } else {
                    setFormatErrors(prev => ({ ...prev, organization: undefined }));
                }
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [formik.values.organization]);

    // Real-time validation for group
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formik.values.group) {
                const validation = validateField('group', formik.values.group, formik.values);
                if (!validation.isValid) {
                    setFormatErrors(prev => ({ ...prev, group: validation.error }));
                } else {
                    setFormatErrors(prev => ({ ...prev, group: undefined }));
                }
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [formik.values.group]);


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                                    disabled={loading}
                                >
                                    <SelectTrigger className={`w-full ${formatErrors.organization ? "border-red-500" : ""}`}>
                                        <SelectValue placeholder={loading ? "Loading organizations..." : "Select organization"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {organizations.map((org, index) => (
                                            <SelectItem key={index} value={org}>
                                                {org}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formatErrors.organization && (
                                    <p className="text-red-500 text-sm">{formatErrors.organization}</p>
                                )}
                                {formik.errors.organization && (
                                    <p className="text-red-500 text-sm">{formik.errors.organization}</p>
                                )}
                            </div>
                            <div className="gap-y-1 flex flex-col">
                                <Label>Group</Label>
                                <Select
                                    onValueChange={(val) => formik.setFieldValue("group", val)}
                                    value={formik.values.group}
                                    disabled={loading}
                                >
                                    <SelectTrigger className={`w-full ${formatErrors.group ? "border-red-500" : ""}`}>
                                        <SelectValue placeholder={loading ? "Loading groups..." : "Select group"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((group, index) => (
                                            <SelectItem key={index} value={group}>
                                                {group}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formatErrors.group && (
                                    <p className="text-red-500 text-sm">{formatErrors.group}</p>
                                )}
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
                                    className={(validationErrors.username || formatErrors.username) ? "border-red-500" : ""}
                                />
                                {formatErrors.username && (
                                    <p className="text-red-500 text-sm">{formatErrors.username}</p>
                                )}
                                {validationErrors.username && (
                                    <p className="text-red-500 text-sm">{validationErrors.username}</p>
                                )}
                                {isValidating && formik.values.username && !formatErrors.username && (
                                    <p className="text-blue-500 text-sm">Checking availability...</p>
                                )}
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
                                    className={formatErrors.firstName ? "border-red-500" : ""}
                                />
                                {formatErrors.firstName && (
                                    <p className="text-red-500 text-sm">{formatErrors.firstName}</p>
                                )}
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
                                    className={formatErrors.lastName ? "border-red-500" : ""}
                                />
                                {formatErrors.lastName && (
                                    <p className="text-red-500 text-sm">{formatErrors.lastName}</p>
                                )}
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
                                    type="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    className={(validationErrors.email || formatErrors.email) ? "border-red-500" : ""}
                                />
                                {formatErrors.email && (
                                    <p className="text-red-500 text-sm">{formatErrors.email}</p>
                                )}
                                {validationErrors.email && (
                                    <p className="text-red-500 text-sm">{validationErrors.email}</p>
                                )}
                                {isValidating && formik.values.email && !formatErrors.email && (
                                    <p className="text-blue-500 text-sm">Checking availability...</p>
                                )}
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
                                    className={formatErrors.password ? "border-red-500" : ""}
                                />
                                {formatErrors.password && (
                                    <p className="text-red-500 text-sm">{formatErrors.password}</p>
                                )}
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
                                    className={formatErrors.confirmPassword ? "border-red-500" : ""}
                                />
                                {formatErrors.confirmPassword && (
                                    <p className="text-red-500 text-sm">{formatErrors.confirmPassword}</p>
                                )}
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
                                    <Button type="button" variant="outline" disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Saving..." : "Save User"}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
