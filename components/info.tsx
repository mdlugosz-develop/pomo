import { useAuth } from '@/contexts/auth-context'
import { useWorkspace } from '@/contexts/workspace-context'
export function Info() {

    const { tasks, currentWorkspace } = useWorkspace()
    const { user } = useAuth()

    return (
        <div>
            <h1>Info</h1>
            <p>{currentWorkspace?.name}</p>
            <p>{tasks.length}</p>   
            <p>{user?.email || 'No user'}</p>
        </div>
    )
}