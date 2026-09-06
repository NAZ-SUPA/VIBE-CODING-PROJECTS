<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SuperAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $admins = Admin::where('role', 'station_admin')->get();
        return response()->json($admins);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string|unique:admins,username',
            'password' => 'required|string|min:6',
            'station_location' => 'required|string',
        ]);

        $admin = Admin::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role' => 'station_admin',
            'station_location' => $request->station_location,
        ]);

        return response()->json(['message' => 'Admin created successfully', 'admin' => $admin], 201);
    }

    public function destroy(Admin $admin): JsonResponse
    {
        if ($admin->role === 'super_admin') {
            return response()->json(['message' => 'Cannot delete super admin account'], 403);
        }

        $admin->delete();

        return response()->json(['message' => 'Admin deleted successfully']);
    }
}
