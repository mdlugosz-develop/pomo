import { useWorkspace } from '@/contexts/workspace-context'
export function Info() {

    const { tasks, currentWorkspace } = useWorkspace()

    return (
        <div>
            <h1>Info</h1>
            <p>{currentWorkspace?.name}</p>
            <p>{tasks.length}</p>   
        </div>
    )
}