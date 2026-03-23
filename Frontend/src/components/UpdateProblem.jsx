import { useNavigate, useParams } from "react-router";
import axiosClient from "../utils/axiosClient";
import { useEffect } from "react";
import {useForm, useFieldArray, Controller} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';

// Validations
const problemSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    // The 'tags' field should be an array, and its values must be only from the 
    // predefined options listed below.
    tags: z.array(
        z.enum([
            "Math", "Array", "String", "Recursion", "LinkedList", 
            "Stack", "Tree", "Graph", "Dynamic Programming", "Two Pointers", "Hash Table",
            "Binary Search", "Backtracking", "Sorting", "Heap", "Greedy"
        ])
    ).min(1, "At least one tag is required"),
    companyTags: z.array(
        z.enum([
            "Amazon", "Apple", "Google", "Meta", "Microsoft", "Salesforce", "Uber", "Adobe", "Netflix", 
            "NVIDIA", "Intel", "IBM", "Oracle", "Tesla", "PayPal", "Cisco", "Shopify", "Spotify"
        ])
    ).optional(),
    visibleTestCases: z.array(
        z.object({
          input: z.string().min(1, 'Input is required'),
          output: z.string().min(1, 'Output is required'),
          explanation: z.string().min(1, 'Explanation is required')
        })
    ).min(1, 'At least one visible test case required'),
    hiddenTestCases: z.array(
        z.object({
          input: z.string().min(1, 'Input is required'),
          output: z.string().min(1, 'Output is required')
        })
    ).min(1, 'At least one hidden test case required'),
    startCode: z.array(
        z.object({
          language: z.enum(['c++', 'java', 'javascript']),
          initialCode: z.string().min(1, 'Initial code is required')
        })
    ).length(3, 'All three languages required'),
    referenceSolution: z.array(
        z.object({
          language: z.enum(['c++', 'java', 'javascript']),
          completeCode: z.string().min(1, 'Complete code is required')
        })
    ).length(3, 'All three languages required')
});

const TAG_OPTIONS = [
    "Math", "Array", "String", "Recursion", "LinkedList", 
    "Stack", "Tree", "Graph", "Dynamic Programming", "Two Pointers", "Hash Table",
    "Binary Search", "Backtracking", "Sorting", "Heap", "Greedy"
];

const COMPANY_TAG_OPTIONS = [
    "Amazon", "Apple", "Google", "Meta", "Microsoft", "Salesforce", "Uber", "Adobe", "Netflix", 
    "NVIDIA", "Intel", "IBM", "Oracle", "Tesla", "PayPal", "Cisco", "Shopify", "Spotify"
];

function UpdateProblem(){
    const { problem_id } = useParams();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        reset, // We need reset to pre-fill the form
        control,
        formState: {errors, isSubmitting},
    } = useForm({
        resolver: zodResolver(problemSchema),
        defaultValues: {
            title: "",
            description: "",
            difficulty: "Easy",
            tags: [],
            companyTags: [],
            visibleTestCases: [],
            hiddenTestCases: [],
            startCode: [
                { language: "c++", initialCode: "" },
                { language: "java", initialCode: "" },
                { language: "javaScript", initialCode: "" }
            ],
            referenceSolution: [
                { language: "c++", completeCode: "" },
                { language: "java", completeCode: "" },
                { language: "javaScript", completeCode: "" }
            ]
        }
    });

    // --- (4) HOOKS FOR DYNAMIC ARRAYS ---
    // We renamed fields as visibleFields for clarity
    const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({
        control, 
        name: "visibleTestCases" // Give same name as in schema
    });
    const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({
        control, 
        name: "hiddenTestCases"
    });
    // Starter code and solutions are fixed-length, so we just use 'fields'
    const { fields: startCodeFields } = useFieldArray({
        control, 
        name: "startCode"
    });
    const { fields: solutionFields } = useFieldArray({
        control, 
        name: "referenceSolution"
    });

    async function fetchProblem(){
        const response = await axiosClient.get(`/problem/getProblem/${problem_id}`);
        const data = response.data;
        // Clean this fetched problem data
        const cleanedData = {
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            
            // Add safety checks here:
            tags: data.tags || [],
            companyTags: data.companyTags || [], 
            
            visibleTestCases: (data.visibleTestCases || []).map(tc => ({
                input: tc.input,
                output: tc.output,
                explanation: tc.explanation
            })),
            
            hiddenTestCases: (data.hiddenTestCases || []).map(tc => ({
                input: tc.input,
                output: tc.output
            })),
            
            startCode: (data.startCode || []).map(sc => ({
                language: sc.language,
                initialCode: sc.initialCode
            })),
            
            referenceSolution: (data.referenceSolution || []).map(rs => ({
                language: rs.language,
                completeCode: rs.completeCode
            }))
        }
        reset(cleanedData);
    }

    useEffect(() => {
        fetchProblem();
    }, []);

    const onSubmit = async(formData) => {
        try{
            const response = await axiosClient.put(`/problem/update/${problem_id}`, formData);
            // Your backend helpfully sends back the updated data.
            console.log("Update successful:", response.data);

            alert("Problem updated successfully!");
            // Navigate back to the problems list
            navigate("/adminPanel/problemsList");
        }
        catch(error){
            const errorMsg = error.message;
            alert(`Error: ${errorMsg}`);
        }
    }

    return (
        <>
        <div className="update-div">
            <img src="/update-new-icon.png" className="update-problem-icon2"></img>
            <p className="update-header-text">Update Problem</p>
        </div>
        <p className="update-header-description">Update the existing problem details using the form below. You can make changes to any part of the problem — title, description, tags, or test cases — and click Update to save your changes in the database.</p>
        
        <div className="form-all-details">
            <h2 className="problem-details">Problem Details</h2>
            <p className="extra-form-text">Review and refine the problem details before saving your updates.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="main-form">
                {/* --- Title --- */}
                <div className="form-element2">
                    <label className="form-label2">Title *</label>
                    <input
                        type="text"
                        className="form-input2"
                        {...register("title")}
                    />
                    {errors.title && (
                        <p className="form-error2">{errors.title.message}</p>
                    )}
                </div>
                {/* --- Description --- */}
                <div className="form-element2">
                    <label className="form-label2">Description *</label>
                    <textarea
                        className="form-input2"
                        rows="10"
                        {...register("description")}
                    />
                    {errors.description && (
                        <p className="form-error2">{errors.description.message}</p>
                    )}
                </div>
                {/* --- Difficulty --- */}
                <div className="form-element2">
                    <label className="form-label2">Difficulty *</label>
                    <select className="form-select" {...register("difficulty")}>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                    {errors.difficulty && (
                        <p className="form-error2">{errors.difficulty.message}</p>
                    )}
                </div>
                {/* --- Tags --- */}
                <div className="form-element2">
                    <label className="form-label2">Tags *</label>
                    <p className="tag-label-description">Select all categories that apply.</p>
                    <Controller
                        name="tags"
                        control={control}
                        render={({ field }) => (
                            <div className="checkbox-group">
                                {TAG_OPTIONS.map((tag) => (
                                    <label key={tag} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            value={tag}
                                            checked={field.value?.includes(tag)}
                                            onChange={(e) => {
                                                const newTags = e.target.checked
                                                    ? [...(field.value || []), tag] // Added safety check for field.value
                                                    : (field.value || []).filter((t) => t !== tag);
                                                field.onChange(newTags);
                                            }}
                                        />
                                        {tag}
                                    </label>
                                ))}
                            </div>
                        )}
                    />
                    {errors.tags && (
                        <p className="form-error2">{errors.tags.message}</p>
                    )}
                </div>
                {/* --- Company Tags (Optional) --- */}
                <div className="form-element2">
                    <label className="form-label2">Company Tags (Optional)</label>
                    <p className="companyTags-label-description">Select all companies that apply.</p>
                    <Controller
                        name="companyTags"
                        control={control}
                        render={({ field }) => (
                            <div className="checkbox-group">
                                {COMPANY_TAG_OPTIONS.map((tag) => (
                                    <label key={tag} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            value={tag}
                                            checked={field.value?.includes(tag)}
                                            onChange={(e) => {
                                                const newTags = e.target.checked
                                                    ? [...(field.value || []), tag] // Added safety check for field.value
                                                    : (field.value || []).filter((t) => t !== tag);
                                                field.onChange(newTags);
                                            }}
                                        />
                                        {tag}
                                    </label>
                                ))}
                            </div>
                        )}
                    />
                    {errors.companyTags && (
                        <p className="form-error2">{errors.companyTags.message}</p>
                    )}
                </div>
                {/* --- Visible Test Cases --- */}
                <div className="form-element2">
                    <label className="form-label2">Visible Test Cases *</label>
                    {visibleFields.map((field, index) => (
                        <div key={field.id} className="array-item">
                            <h3 className="array-item-title">Test Case {index + 1}</h3>
                            <div className="form-element3">
                                <label className="form-label3">Input *</label>
                                <textarea className="form-textarea" {...register(`visibleTestCases.${index}.input`)} />
                                {errors.visibleTestCases?.[index]?.input && <p className="form-error3">{errors.visibleTestCases[index].input.message}</p>}
                            </div>
                            <div className="form-element3">
                                <label className="form-label3">Output *</label>
                                <textarea className="form-textarea" {...register(`visibleTestCases.${index}.output`)} />
                                {errors.visibleTestCases?.[index]?.output && <p className="form-error3">{errors.visibleTestCases[index].output.message}</p>}
                            </div>
                            <div className="form-element3">
                                <label className="form-label3">Explanation *</label>
                                <textarea className="form-textarea" {...register(`visibleTestCases.${index}.explanation`)} />
                                {errors.visibleTestCases?.[index]?.explanation && <p className="form-error3">{errors.visibleTestCases[index].explanation.message}</p>}
                            </div>
                            <button type="button" className="btn-remove" onClick={() => removeVisible(index)}>
                                Remove Test Case
                            </button>
                        </div>
                    ))}
                    <button type="button" className="btn-add" onClick={() => appendVisible({ input: '', output: '', explanation: '' })}>
                        Add Visible Test Case
                    </button>
                    {errors.visibleTestCases && <p className="form-error2">{errors.visibleTestCases.message}</p>}
                </div>
                {/* --- Hidden Test Cases --- */}
                <div className="form-element2">
                    <label className="form-label2">Hidden Test Cases *</label>
                    {hiddenFields.map((field, index) => (
                        <div key={field.id} className="array-item">
                            <h3 className="array-item-title">Hidden Case {index + 1}</h3>
                            <div className="form-element3">
                                <label className="form-label3">Input *</label>
                                <textarea className="form-textarea" {...register(`hiddenTestCases.${index}.input`)} />
                                {errors.hiddenTestCases?.[index]?.input && <p className="form-error3">{errors.hiddenTestCases[index].input.message}</p>}
                            </div>
                            <div className="form-element3">
                                <label className="form-label3">Output *</label>
                                <textarea className="form-textarea" {...register(`hiddenTestCases.${index}.output`)} />
                                {errors.hiddenTestCases?.[index]?.output && <p className="form-error3">{errors.hiddenTestCases[index].output.message}</p>}
                            </div>
                            <button type="button" className="btn-remove" onClick={() => removeHidden(index)}>
                                Remove Hidden Case
                            </button>
                        </div>
                    ))}
                    <button type="button" className="btn-add" onClick={() => appendHidden({ input: '', output: '' })}>
                        Add Hidden Test Case
                    </button>
                    {errors.hiddenTestCases && <p className="form-error">{errors.hiddenTestCases.message}</p>}
                </div>
                {/* --- Starter Code --- */}
                <div className="form-element2">
                    <label className="form-label2">Starter Code *</label>
                    {startCodeFields.map((field, index) => (
                        <div key={field.id} className="array-item-fixed">
                            <h3 className="array-item-title">{field.language}</h3>
                            <input type="hidden" {...register(`startCode.${index}.language`)} />
                            <textarea
                                className="form-textarea code"
                                rows="10"
                                {...register(`startCode.${index}.initialCode`)}
                            />
                            {errors.startCode?.[index]?.initialCode && <p className="form-error3">{errors.startCode[index].initialCode.message}</p>}
                        </div>
                    ))}
                    {errors.startCode && <p className="form-error2">{errors.startCode.message}</p>}
                </div>
                {/* --- Reference Solution --- */}
                <div className="form-element2">
                    <label className="form-label2">Reference Solution *</label>
                    {solutionFields.map((field, index) => (
                        <div key={field.id} className="array-item-fixed">
                            <h3 className="array-item-title">{field.language}</h3>
                            <input type="hidden" {...register(`referenceSolution.${index}.language`)} />
                            <textarea
                                className="form-textarea code"
                                rows="15"
                                {...register(`referenceSolution.${index}.completeCode`)}
                            />
                            {errors.referenceSolution?.[index]?.completeCode && <p className="form-error3">{errors.referenceSolution[index].completeCode.message}</p>}
                        </div>
                    ))}
                    {errors.referenceSolution && <p className="form-error2">{errors.referenceSolution.message}</p>}
                </div>
                {/* --- Submit Button --- */}
                <div className="form-submit-section">
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Problem'}
                    </button>
                </div>
            </form>
        </div>
        </>
    )
}

export default UpdateProblem;