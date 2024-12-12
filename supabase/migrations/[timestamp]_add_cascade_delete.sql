-- Drop the existing foreign key constraint
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_workspace_id_fkey;

-- Add the new constraint with ON DELETE CASCADE
ALTER TABLE tasks
ADD CONSTRAINT tasks_workspace_id_fkey 
FOREIGN KEY (workspace_id) 
REFERENCES workspaces(id) 
ON DELETE CASCADE; 