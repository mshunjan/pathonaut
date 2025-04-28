"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowUpDown, CheckSquare2Icon, SquareIcon } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

// Utility type: value shape depends on `multiple`
type ComboboxValue<T, M extends boolean> = M extends true
  ? T[]             // multiple = true → array of T
  : T | null;       // multiple = false → single T or null

interface ComboboxProps<
  T extends { id: string; name: string },
  M extends boolean = true
> {
  items: T[];
  value?: ComboboxValue<T, M>;
  onChange?: (value: ComboboxValue<T, M>) => void;
  multiple?: M;
  disabled?: boolean;
  limit?: number;
  itemToString?: (item: T) => string;
  title?: string;
  description?: string;
  label?: string;
  searchPlaceholder?: string;
  selectAll?: boolean;
}

export function Combobox<
  T extends { id: string; name: string },
  M extends boolean = true
>({
  items,
  value: controlledValue,
  onChange,
  multiple = true as M,
  disabled = false,
  itemToString = (item) => item.name,
  title = "Select Item(s)",
  description = "",
  label = "",
  searchPlaceholder = "Search...",
  selectAll = true,
}: ComboboxProps<T, M>) {
  // Internal state: separate for single vs multiple
  const [internalMultiple, setInternalMultiple] = React.useState<T[]>([]);
  const [internalSingle, setInternalSingle] = React.useState<T | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const isMobile = useMediaQuery("md", "down");

  // Normalize selected items to an array for easy checks
  const selectedArray: T[] = React.useMemo(() => {
    if (multiple) {
      return (controlledValue ?? internalMultiple) as T[];
    } else {
      const single = (controlledValue as T | null) ?? internalSingle;
      return single ? [single] : [];
    }
  }, [controlledValue, internalMultiple, internalSingle, multiple]);

  // Common updater: maps new array back to either array or single
  const triggerChange = React.useCallback(
    (newArray: T[]) => {
      if (onChange) {
        if (multiple) {
          onChange(newArray as ComboboxValue<T, M>);
        } else {
          onChange((newArray[0] ?? null) as ComboboxValue<T, M>);
        }
      } else {
        if (multiple) {
          setInternalMultiple(newArray);
        } else {
          setInternalSingle(newArray[0] ?? null);
        }
      }
    },
    [multiple, onChange]
  );

  // Selection handlers
  const handleChange = React.useCallback((item: T) => {
    const isSel = selectedArray.some((v) => v.id === item.id);
    let next: T[];
    if (multiple) {
      next = isSel
        ? selectedArray.filter((v) => v.id !== item.id)
        : [...selectedArray, item];
    } else {
      next = isSel ? [] : [item];
    }
    triggerChange(next);
  }, [multiple, selectedArray, triggerChange]);

  const handleSelectAll = React.useCallback(() => {
    triggerChange(items);
  }, [items, triggerChange]);

  const handleClearAll = React.useCallback(() => {
    triggerChange([]);
  }, [triggerChange]);

  // Dropdown list with search & virtualization
  const DropdownContent = () => {
    const [filtered, setFiltered] = React.useState<T[]>(items);
    const parentRef = React.useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
      count: filtered.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 35,
    });

    const onSearch = (q: string) =>
      setFiltered(
        items.filter((it) =>
          itemToString(it).toLowerCase().includes(q.toLowerCase())
        )
      );

    return (
      <Command shouldFilter={false}>
        {multiple && (
          <div className="flex items-center justify-between p-2">
            {selectAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                disabled={disabled}
                className="flex items-center gap-2"
              >
                <CheckSquare2Icon /> Select All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <SquareIcon /> Clear All
            </Button>
          </div>
        )}
        <CommandSeparator />
        <CommandInput
          placeholder={searchPlaceholder}
          onValueChange={onSearch}
          className="h-9"
          disabled={disabled}
        />
        <CommandList className="overflow-hidden">
          {filtered.length === 0 ? (
            <CommandEmpty>No items found</CommandEmpty>
          ) : (
            <CommandGroup ref={parentRef} className="overflow-auto max-h-60">
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: 'relative',
                  width: '100%',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((v) => {
                  const item = filtered[v.index];
                  return (
                    <CommandItem
                      key={item.id}
                      value={itemToString(item)}
                      onSelect={() => handleChange(item)}
                      disabled={disabled}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${v.size}px`,
                        transform: `translateY(${v.start}px)`,
                      }}
                    >
                      <span className="truncate">{itemToString(item)}</span>
                      <CheckSquare2Icon
                        className={cn(
                          'ml-auto h-4 w-4',
                          selectedArray.some((val) => val.id === item.id)
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </div>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    );
  };

  const ButtonContent = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'>>((props, ref) => (
    <Button
      ref={ref}
      variant="outline"
      role="combobox"
      className="justify-between"
      disabled={disabled}
      {...props}
    >
      {selectedArray.length > 1 ? (
        <Badge>{selectedArray.length} selected</Badge>
      ) : selectedArray.length === 1 ? (
        itemToString(selectedArray[0])
      ) : (
        title
      )}
      <ArrowUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  ));
  ButtonContent.displayName = 'combobox-trigger';

  return (
    <>
      {isMobile ? (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <div className="flex flex-col gap-2">
            <Label>{label}</Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <DrawerTrigger asChild>
              <ButtonContent />
            </DrawerTrigger>
          </div>
          <DrawerContent>
            <div className="p-4 flex flex-col gap-4">
              <DrawerTitle>{title}</DrawerTitle>
              {description && <DrawerDescription>{description}</DrawerDescription>}
            </div>
            <DropdownContent />
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover>
          <div className="flex flex-col gap-2">
            <Label>{label}</Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <PopoverTrigger asChild>
              <ButtonContent />
            </PopoverTrigger>
          </div>
          <PopoverContent className="p-0" align="start">
            <DropdownContent />
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
