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
import {
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFormik } from "formik"
import { useState, useEffect } from "react"
import { updateUser } from "@/api/userListing"
import { checkUserExists } from "@/api/userListing"
import { validateField, isReadyForValidation, validateEditUserFields } from "@/lib/validation"
import { useOrganizationsAndGroups } from "@/hooks/useOrganizationsAndGroups"
import { USER_ATTR } from "@/lib/utils.user"

interface EditUserFormProps {
    user: USER_ATTR;
    onUserUpdated: () => void;
}

const initialUserDetails = {
    organization: "",
    group: "",
    username: "",
    firstName: "",
    lastName: "",
    email: "",
}

export function EditUserForm({ user, onUserUpdated }: EditUserFormProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { organizations, groups, loading } = useOrganizationsAndGroups();
    const [validationErrors, setValidationErrors] = useState<{
        username?: string;
        email?: string;
    }>({});
    const [formatErrors, setFormatErrors] = useState<{
        username?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        organization?: string;
        group?: string;
    }>({});
    const [isValidating, setIsValidating] = useState(false);

    // Real-time validation function
    const validateUserExists = async (field: 'username' | 'email', value: string) => {
        if (!value.trim()) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
            setFormatErrors(prev => ({ ...prev, [field]: undefined }));
            return;
        }

        // Skip validation if the value hasn't changed from original
        if (field === 'username' && value === user.username) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
            return;
        }
        if (field === 'email' && value === user.email) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
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
            // Error handled silently
        } finally {
            setIsValidating(false);
        }
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            organization: user.organization || "",
            group: user.groups || "",
            username: user.username || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
        },
        onSubmit: async (values: any, action: any) => {
            if (step < 3) {
                setStep(step + 1)
            } else {
                // Final submit
                const allValidation = validateEditUserFields(values);
                if (!allValidation.isValid || validationErrors.username || validationErrors.email) {
                    setFormatErrors(allValidation.errors);
                    return;
                }

                setIsSubmitting(true);
                try {
                    await updateUser(user.id, {
                        username: values.username,
                        email: values.email,
                        firstName: values.firstName,
                        lastName: values.lastName,
                        organization: values.organization,
                        group: values.group,
                    });
                    
                    // Reset form and close dialog
                    formik.resetForm();
                    setStep(1);
                    setIsOpen(false);
                    setValidationErrors({});
                    setFormatErrors({});
                    onUserUpdated();
                } catch (error: any) {
                    const errorMessage = error.response?.data?.error || error.message || "Failed to update user. Please try again.";
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
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formik.values.username]);

    // Debounced validation for email
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formik.values.email) {
                validateUserExists('email', formik.values.email);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formik.values.email]);

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

    // Helper function to check if form is ready for submission
    const isFormReadyForSubmission = () => {
        const { username, email, firstName, lastName, organization, group } = formik.values;
        
        // Check if all required fields have values
        const hasAllRequiredFields = username.trim() !== '' && 
                                   email.trim() !== '' && 
                                   firstName.trim() !== '' && 
                                   lastName.trim() !== '' && 
                                   organization.trim() !== '' && 
                                   group.trim() !== '';
        
        // Check if there are any validation errors
        const hasValidationErrors = validationErrors.username || validationErrors.email;
        const hasFormatErrors = formatErrors.username || formatErrors.email || 
                               formatErrors.firstName || formatErrors.lastName || 
                               formatErrors.organization || formatErrors.group;
        
        return hasAllRequiredFields && !hasValidationErrors && !hasFormatErrors && !isValidating;
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Edit User
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] h-[65vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Step {step} of 3
                    </DialogDescription>
                </DialogHeader>
                <form
                    id="edit-user-form"
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
                        </div>
                    </div>
                )}
                {/* STEP 3: Email */}
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
                                    disabled={isSubmitting || !isFormReadyForSubmission()}
                                >
                                    {isSubmitting ? "Updating..." : "Update User"}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
