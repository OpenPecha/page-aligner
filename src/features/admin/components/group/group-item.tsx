import { useState } from 'react'
import { ChevronDown, Edit, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useGetGroupUsers } from '../../api/group'
import { GroupUserList } from './group-user-list'
import { GroupDialog } from './group-dialog'
import { DeleteGroupDialog } from './delete-group-dialog'
import type { Group } from '@/types'

interface GroupItemProps {
  group: Group
}

export function GroupItem({ group }: GroupItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Fetch group with users only when expanded
  const { data: groupUsers, isLoading: isLoadingUsers } = useGetGroupUsers(
    group.name,
    isExpanded
  )

  const users = groupUsers ?? []
  const userCount = users.length

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev)
  }

  return (
    <>
      <Card className="overflow-hidden transition-all duration-200">
        <CardHeader className="p-0">
          <button
            onClick={toggleExpand}
            className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base truncate">{group.name}</h3>
                {isExpanded && !isLoadingUsers && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    <Users className="h-3 w-3" />
                    {userCount}
                  </span>
                )}
              </div>
              {group.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {group.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditDialogOpen(true)
                }}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit group</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete group</span>
              </Button>
              <ChevronDown
                className={cn(
                  'h-5 w-5 text-muted-foreground transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
              />
            </div>
          </button>
        </CardHeader>

        <div
          className={cn(
            'grid transition-all duration-200 ease-in-out',
            isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <div className="overflow-hidden">
            <CardContent className="pt-0 pb-4 px-4 border-t">
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Members
                </h4>
                <GroupUserList
                  users={users}
                  isLoading={isLoadingUsers}
                />
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <GroupDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        group={group}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteGroupDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        group={group}
        usersInGroup={users}
      />
    </>
  )
}

// Skeleton for loading state
export function GroupItemSkeleton() {
  return (
    <Card>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

